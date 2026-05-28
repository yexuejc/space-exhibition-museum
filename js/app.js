// ===== 太空探索博物馆 - 应用入口 =====
// 场景初始化 + 主循环（整合所有模块）

var zoomFromSlider = false;

function initVR() {
    // 检查 Three.js 是否加载
    if (typeof THREE === 'undefined') {
        document.getElementById('vrContainer').innerHTML =
            '<div style="color:#f44;padding:40px;text-align:center;">❌ Three.js 库加载失败，请检查网络连接</div>';
        return;
    }

    // 1. 构建 3D 太阳系场景
    buildSolarSystem();

    // 2. 创建小行星带
    createAsteroidBelt();

    // 3. 创建卫星系统
    createMoons();

    // 4. 创建星座
    createConstellations();

    // 5. 启动时间引擎
    initTimeEngine();

    // 5. 设置 UI 交互
    setupLabelsToggle();
    setupFullscreenToggle();
    setupZoomSlider();
    setupTimeControls();
    setupTipBar();
    setupNavigationPanel();
    setupInteractionEvents();
    setupResizeHandler();
    setupSpeechControl();

    // 6. 设置地图模式
    setupMapModeButton();

    // 7. 默认显示标签
    SPACEDEMO.labelObjects.forEach(function(lo) {
        lo.div.style.display = '';
    });

    // 8. VR 渲染器启用
    if (SPACEDEMO.renderer.xr) {
        SPACEDEMO.renderer.xr.enabled = true;
    }

    // 对外暴露（用于 VR 按钮等）
    window.initVR = initVR;

    // ===== 主循环开始 =====
    function animate() {
        requestAnimationFrame(animate);

        // 更新时间
        updateTime();

        // 更新行星位置
        SPACEDEMO.planets.forEach(function(p) {
            var angle = getPlanetAngle(p.data);
            p.mesh.position.x = Math.cos(angle) * p.data.dist;
            p.mesh.position.z = Math.sin(angle) * p.data.dist;
            p.mesh.rotation.y = getPlanetRotation(p.data);
            // 土星环跟随
            if (p.ringMesh) {
                p.ringMesh.position.copy(p.mesh.position);
                p.ringMesh.rotation.y += 0.001;
            }
        });

        // 更新轨道标记点位置
        if (SPACEDEMO.orbitMarkers) {
            SPACEDEMO.orbitMarkers.forEach(function(om) {
                var angle = getPlanetAngle(om.planetData);
                var pos = om.marker.geometry.attributes.position.array;
                pos[0] = Math.cos(angle) * om.dist;
                pos[2] = Math.sin(angle) * om.dist;
                om.marker.geometry.attributes.position.needsUpdate = true;
            });
        }

        // 太阳自转 + 日冕动画
        SPACEDEMO.sun.rotation.y += 0.0008;
        var coronaTime = performance.now() / 1000;
        // 更新辉光 Shader 时间
        if (SPACEDEMO.glowMat) SPACEDEMO.glowMat.uniforms.uTime.value = coronaTime;
        if (SPACEDEMO.outerGlowMat) SPACEDEMO.outerGlowMat.uniforms.uTime.value = coronaTime;
        // 更新星星 Shader 时间
        if (SPACEDEMO.starMat) SPACEDEMO.starMat.uniforms.uTime.value = coronaTime;
        // 日冕粒子动画
        if (SPACEDEMO.coronaParticles && SPACEDEMO.coronaData) {
            var cd = SPACEDEMO.coronaData;
            var pos = SPACEDEMO.coronaParticles.geometry.attributes.position.array;
            for (var ci = 0; ci < cd.count; ci++) {
                cd.theta[ci] += 0.005 * cd.speeds[ci];
                var baseAngle = cd.theta[ci];
                var r = SUN_RADIUS * (1.2 + 0.8 * (0.5 + 0.5 * Math.sin(coronaTime * cd.speeds[ci] + cd.offsets[ci])));
                var phiOff = 0.3 * Math.sin(coronaTime * 0.3 + cd.offsets[ci]);
                pos[ci*3] = r * Math.sin(baseAngle) * Math.cos(phiOff);
                pos[ci*3+1] = r * Math.sin(phiOff) * 0.8;
                pos[ci*3+2] = r * Math.cos(baseAngle) * Math.cos(phiOff);
            }
            SPACEDEMO.coronaParticles.geometry.attributes.position.needsUpdate = true;
            // 粒子大小脉动
            var sizes = SPACEDEMO.coronaParticles.geometry.attributes.size;
            if (sizes) {
                var sArr = sizes.array;
                for (var ci = 0; ci < cd.count; ci++) {
                    sArr[ci] = (0.3 + 0.5 * Math.sin(coronaTime * 1.2 + cd.offsets[ci])) * 1.5 + 0.3;
                }
                sizes.needsUpdate = true;
            }
        }

        // 更新小行星带
        updateAsteroids();

        // 更新卫星
        updateMoons();

        // ===== 聚焦动画（平滑移动相机到目标）=====
        if (SPACEDEMO.focusAnim) {
            SPACEDEMO.focusAnim.progress += 0.025;
            var finished = SPACEDEMO.focusAnim.progress >= 1;
            if (finished) SPACEDEMO.focusAnim.progress = 1;
            var t = easeOutCubic(SPACEDEMO.focusAnim.progress);
            SPACEDEMO.controls.target.lerpVectors(
                SPACEDEMO.focusAnim.startTarget, SPACEDEMO.focusAnim.endTarget, t
            );
            SPACEDEMO.camera.position.lerpVectors(
                SPACEDEMO.focusAnim.startCam, SPACEDEMO.focusAnim.endCam, t
            );
            if (finished) SPACEDEMO.focusAnim = null;
        }

        // ===== 聚焦追踪（动画结束后持续跟随行星）=====
        if (SPACEDEMO.focusedPlanet && !SPACEDEMO.focusAnim) {
            var fp = SPACEDEMO.focusedPlanet;
            SPACEDEMO.controls.target.copy(fp.mesh.position);
            SPACEDEMO.focusRing.position.copy(fp.mesh.position);
            SPACEDEMO.focusRing.position.y += fp.data.radius + 0.8;
            SPACEDEMO.focusRing.rotation.x = -Math.PI / 2;
            SPACEDEMO.focusRing.rotation.z += 0.02;

            // 标签高亮
            SPACEDEMO.labelObjects.forEach(function(lo) {
                if (lo.data === fp.data) lo.div.classList.add('focused');
                else lo.div.classList.remove('focused');
            });
        } else {
            SPACEDEMO.focusRing.visible = false;
            SPACEDEMO.labelObjects.forEach(function(lo) {
                lo.div.classList.remove('focused');
            });
        }

        // ===== 缩放滑块控制（平滑逼近目标距离）=====
        var currentDist = SPACEDEMO.camera.position.distanceTo(SPACEDEMO.controls.target);
        if (SPACEDEMO.targetZoomDist !== null) {
            var newDist = currentDist + (SPACEDEMO.targetZoomDist - currentDist) * 0.12;
            if (Math.abs(newDist - SPACEDEMO.targetZoomDist) < 0.01) newDist = SPACEDEMO.targetZoomDist;
            var dir = SPACEDEMO.camera.position.clone().sub(SPACEDEMO.controls.target).normalize();
            SPACEDEMO.camera.position.copy(SPACEDEMO.controls.target).add(dir.multiplyScalar(newDist));
            if (Math.abs(newDist - SPACEDEMO.targetZoomDist) < 0.01) SPACEDEMO.targetZoomDist = null;
        }

        // ===== 滚轮缩放时更新滑块 =====
        var slider = document.getElementById('zoomSlider');
        var zv = document.getElementById('zoomValue');
        if (slider && !zoomFromSlider) {
            var sv = zoomToSlider(currentDist);
            slider.value = sv;
            if (zv) zv.textContent = Math.round((1 - sv/1000) * 100) + '%';
        }
        zoomFromSlider = false;

        // 更新日期标签
        updateDateLabel();

        // 更新地图模式按钮
        updateEnterMapButton();

        // ===== 自动进入地图模式检测 =====
        checkAutoEnterMap();

        // 更新标签可见性（基于相机距离）
        SPACEDEMO.labelObjects.forEach(function(lo) {
            if (!SPACEDEMO.labelsVisible) {
                lo.div.style.display = 'none';
                return;
            }
            var worldPos = new THREE.Vector3();
            lo.label.getWorldPosition(worldPos);
            var dist = SPACEDEMO.camera.position.distanceTo(worldPos);
            var isClose = dist < 25;
            lo.div.style.opacity = isClose ? '1' : '0';
            lo.div.style.transform = isClose ? 'scale(1)' : 'scale(0.8)';
        });

        // 渲染
        if (!SPACEDEMO.mapModeActive) {
            SPACEDEMO.controls.update();
            SPACEDEMO.renderer.render(SPACEDEMO.scene, SPACEDEMO.camera);
            if (SPACEDEMO.labelRenderer) {
                SPACEDEMO.labelRenderer.render(SPACEDEMO.scene, SPACEDEMO.camera);
            }
        }
    }

    animate();
}

// ===== 启动逻辑 =====
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    // 延迟初始化 VR，让页面先渲染出来
    setTimeout(initVR, 500);
});
