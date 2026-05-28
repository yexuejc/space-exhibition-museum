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

    // 6. 初始化流星雨
    initMeteors();

    // 7. 设置地图模式
    setupMapModeButton();

    // 8. 自动漫游按钮
    setupAutoTour();

    // 9. 语言切换按钮
    setupLangToggle();

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

    // 帧时间追踪（用于流星等）
    var lastFrameTime = performance.now();

    // ===== 主循环开始 =====
    function animate() {
        requestAnimationFrame(animate);

        var now = performance.now();
        var deltaTime = (now - lastFrameTime) / 1000;
        if (deltaTime > 0.1) deltaTime = 0.016; // 防止切标签后跳帧
        lastFrameTime = now;

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

        // 更新冥王星位置（倾斜轨道）
        if (SPACEDEMO.pluto) {
            var pAngle = getPlanetAngle(SPACEDEMO.pluto.data);
            var pIncline = (SPACEDEMO.pluto.data.orbitalInclination || 0) * Math.PI / 180;
            var pDist = SPACEDEMO.pluto.data.dist;
            SPACEDEMO.pluto.mesh.position.set(
                Math.cos(pAngle) * pDist,
                Math.sin(pAngle) * pDist * Math.sin(pIncline),
                Math.sin(pAngle) * pDist * Math.cos(pIncline)
            );
            SPACEDEMO.pluto.mesh.rotation.y = getPlanetRotation(SPACEDEMO.pluto.data);
        }

        // 更新更多矮行星位置（谷神星、阋神星）
        ['ceres','eris'].forEach(function(key) {
            if (SPACEDEMO[key]) {
                var obj = SPACEDEMO[key];
                var angle = getPlanetAngle(obj.data);
                var incl = (obj.data.orbitalInclination || 0) * Math.PI / 180;
                obj.mesh.position.set(
                    Math.cos(angle) * obj.data.dist,
                    Math.sin(angle) * obj.data.dist * Math.sin(incl),
                    Math.sin(angle) * obj.data.dist * Math.cos(incl)
                );
                obj.mesh.rotation.y = getPlanetRotation(obj.data);
            }
        });

        // ===== 彗星轨道更新 =====
        if (SPACEDEMO.comet) {
            var c = SPACEDEMO.comet;
            // 沿椭圆轨道推进角度
            var speedFactor = SPACEDEMO.speedMultiplier || 1;
            c.angle += 0.001 * speedFactor * (2 * Math.PI / c.data.orbitalPeriod);
            var theta = c.angle;
            var incl = (c.data.orbitalInclination || 0) * Math.PI / 180;
            var a = (c.data.perihelionDist + c.data.aphelionDist) / 2;
            var ecc = (c.data.aphelionDist - c.data.perihelionDist) / (c.data.perihelionDist + c.data.aphelionDist);
            var r = a * (1 - ecc * ecc) / (1 + ecc * Math.cos(theta));
            // 计算近日点偏移角度
            var periOffset = (c.data.argOfPerihelion || 0) * Math.PI / 180;
            var th = theta + periOffset;
            var x = Math.cos(th) * r;
            var z = Math.sin(th) * r;
            var y = Math.sin(th) * r * Math.sin(incl);
            z *= Math.cos(incl);
            c.mesh.position.set(x, y, z);
            c.mesh.rotation.y += 0.005 * speedFactor;

            // ---- 更新彗星尾 ----
            // 尾巴方向：从太阳指向彗星（背离太阳）
            var sunDir = c.mesh.position.clone().normalize();
            // 距离太阳的距离决定尾巴强度
            var distToSun = c.mesh.position.length();
            // 近日点时强度最大，远日点时最小
            var tailStrength = Math.max(0, 1 - (distToSun - c.data.perihelionDist) / (c.data.aphelionDist - c.data.perihelionDist));
            tailStrength = Math.pow(tailStrength, 0.6); // 非线性映射

            var tailLen = 1.5 + tailStrength * 7;  // 尾巴长度（最大~8.5，近日点不超地球轨道）
            var pos = c.tailGeom.attributes.position.array;
            var count = c.tailCount;

            // 构建正交基（用于尾巴横向扩散）
            var up = new THREE.Vector3(0, 1, 0);
            if (Math.abs(sunDir.dot(up)) > 0.9) up.set(1, 0, 0);
            var right = new THREE.Vector3().crossVectors(sunDir, up).normalize();
            var localUp = new THREE.Vector3().crossVectors(right, sunDir).normalize();

            for (var i = 0; i < count; i++) {
                var t = i / count;
                // 使用预生成种子（避免每帧随机闪烁）
                var angleH = c.tailSeedAngles[i];
                // 粒子沿尾巴方向分布，近端密远端疏
                var dist = tailLen * Math.pow(t, 0.7);
                // 横向扩散随距离增大（减小扩散范围）
                var spread = 0.15 + t * 0.6;
                var sideX = Math.cos(angleH) * spread * t;
                var sideY = Math.sin(angleH) * spread * t * 0.2;
                // 弯曲效果（太阳风）
                var bend = t * t * 1.5 * tailStrength;
                // 基础尾向量
                var basePos = new THREE.Vector3().copy(sunDir).multiplyScalar(dist);
                basePos.add(right.clone().multiplyScalar(sideX));
                basePos.add(localUp.clone().multiplyScalar(sideY));
                basePos.y -= bend * 0.15;

                pos[i*3] = c.mesh.position.x - basePos.x;
                pos[i*3+1] = c.mesh.position.y - basePos.y;
                pos[i*3+2] = c.mesh.position.z - basePos.z;
            }
            c.tailGeom.attributes.position.needsUpdate = true;
            // 统一控制尾巴大小和透明度（调暗）
            c.tailMat.size = 0.3 + tailStrength * 0.8;
            c.tailMat.opacity = 0.1 + tailStrength * 0.3;
        }

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
                var r = SUN_RADIUS * (1.1 + 0.3 * (0.5 + 0.5 * Math.sin(coronaTime * cd.speeds[ci] + cd.offsets[ci])));
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
                    sArr[ci] = 0.3 + 0.2 * Math.sin(coronaTime * 1.2 + cd.offsets[ci]);
                }
                sizes.needsUpdate = true;
            }
        }

        // 更新小行星带
        updateAsteroids();

        // 更新流星雨
        updateMeteors(deltaTime);

        // 银河背景缓慢旋转
        if (SPACEDEMO.milkyWay) {
            SPACEDEMO.milkyWay.rotation.y += 0.00005;
        }
        if (SPACEDEMO.milkyWayCore) {
            SPACEDEMO.milkyWayCore.rotation.y += 0.00006;
        }

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

            // 标签高亮
            SPACEDEMO.labelObjects.forEach(function(lo) {
                if (lo.data === fp.data) lo.div.classList.add('focused');
                else lo.div.classList.remove('focused');
            });
        } else if (!tourActive) {
            // 非漫游模式才清除高亮
            SPACEDEMO.labelObjects.forEach(function(lo) {
                lo.div.classList.remove('focused');
            });
        }
        // 漫游模式时标签高亮由 updateTour 控制
        if (tourActive) {
            updateTour();
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
