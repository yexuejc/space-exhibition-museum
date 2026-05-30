// ===== 太空探索博物馆 - 应用入口 =====
// 场景初始化 + 主循环（整合所有模块）
(function(SPACEDEMO, win, doc, THREE, undefined) {
    "use strict";

var zoomFromSlider = false;

function initVR() {
    // 检查 Three.js 是否加载
    if (typeof THREE === 'undefined') {
        document.getElementById('vrContainer').innerHTML =
            '<div style="color:#f44;padding:40px;text-align:center;">❌ Three.js 库加载失败，请检查网络连接</div>';
        return;
    }

    // 检查 WebGL 支持
    try {
        var testCanvas = document.createElement('canvas');
        var gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
        if (!gl) {
            document.getElementById('vrContainer').innerHTML =
                '<div style="color:#ff8800;padding:40px;text-align:center;font-size:18px;">' +
                '💫 您的设备或浏览器暂不支持 WebGL 3D 渲染。<br>' +
                '<span style="font-size:14px;color:rgba(255,255,255,0.6);">' +
                '建议使用最新版 Chrome、Firefox 或 Edge 浏览器打开。</span></div>';
            return;
        }
    } catch(e) {
        // WebGL 检测异常时继续尝试
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

    // 隐藏加载指示器
    var loadingEl = document.querySelector('#vrContainer #loadingIndicator');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }

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

        // ===== 统一天体位置更新（替代原来的 4 段零散代码）=====
        SPACEDEMO.allBodies.forEach(function(body) {
            var data = body.data;
            var angle = getPlanetAngle(data);
            var speedFactor = SPACEDEMO.speedMultiplier || 1;

            if (data.type === 'comet') {
                // ---- 彗星：椭圆轨道 + 动态尾巴 ----
                var c = body;
                c.angle += 0.001 * speedFactor * (2 * Math.PI / data.orbitalPeriod);
                var theta = c.angle;
                var incl = (data.orbitalInclination || 0) * Math.PI / 180;
                var a = (data.perihelionDist + data.aphelionDist) / 2;
                var ecc = (data.aphelionDist - data.perihelionDist) / (data.perihelionDist + data.aphelionDist);
                var r = a * (1 - ecc * ecc) / (1 + ecc * Math.cos(theta));
                var periOffset = (data.argOfPerihelion || 0) * Math.PI / 180;
                var th = theta + periOffset;
                var x = Math.cos(th) * r;
                var z = Math.sin(th) * r;
                var y = Math.sin(th) * r * Math.sin(incl);
                z *= Math.cos(incl);
                c.mesh.position.set(x, y, z);
                c.mesh.rotation.y += 0.005 * speedFactor;

                // 彗星尾巴更新
                var sunDir = c.mesh.position.clone().normalize();
                var distToSun = c.mesh.position.length();
                var tailStrength = Math.max(0, 1 - (distToSun - data.perihelionDist) / (data.aphelionDist - data.perihelionDist));
                tailStrength = Math.pow(tailStrength, 0.6);
                var tailLen = 1.5 + tailStrength * 7;
                var pos = c.tailGeom.attributes.position.array;
                var count = c.tailCount;
                for (var ti = 0; ti < count; ti++) {
                    var t = (ti / count);
                    var dist = t * tailLen;
                    var spread = (1 - t) * 0.6 + 0.05;
                    var bend = t * t * 0.2;
                    var spreadAngle = c.tailSeedAngles[ti];
                    var offset = c.tailSeedOffsets[ti];
                    var pi3 = ti / count;
                    var sz = dist * spread * Math.sin(spreadAngle + pi3 * 0.5) * (0.8 + 0.4 * Math.sin(offset + ti * 0.3));
                    var sy = dist * spread * Math.cos(spreadAngle + pi3 * 0.3) * (0.8 + 0.4 * Math.cos(offset + ti * 0.5));
                    var sx = -dist + bend * dist;
                    var idx = ti * 3;
                    pos[idx] = sx;
                    pos[idx+1] = sy;
                    pos[idx+2] = sz;
                }
                c.tailGeom.attributes.position.needsUpdate = true;
                // 透明度随距离变化
                c.tailMat.opacity = 0.1 + tailStrength * 0.3;
                // 旋转尾巴指向背离太阳方向
                var quat = new THREE.Quaternion().setFromUnitVectors(
                    new THREE.Vector3(0, 0, 1),
                    sunDir
                );
                c.tailPoints.quaternion.copy(quat);
                c.tailPoints.position.copy(c.mesh.position);
            } else {
                // ---- 行星/矮行星：圆形/倾斜轨道 ----
                var incl = (data.orbitalInclination || 0) * Math.PI / 180;
                if (incl === 0) {
                    // 平面轨道（8大行星）
                    body.mesh.position.x = Math.cos(angle) * data.dist;
                    body.mesh.position.z = Math.sin(angle) * data.dist;
                } else {
                    // 倾斜轨道（矮行星）
                    body.mesh.position.set(
                        Math.cos(angle) * data.dist,
                        Math.sin(angle) * data.dist * Math.sin(incl),
                        Math.sin(angle) * data.dist * Math.cos(incl)
                    );
                }
                body.mesh.rotation.y = getPlanetRotation(data);

                // 行星环跟随
                if (body.ringMesh) {
                    body.ringMesh.position.copy(body.mesh.position);
                    body.ringMesh.rotation.y += 0.001;
                }
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

// ===== 启动逻辑（延迟加载：用户点击"进入太阳系"后才初始化 3D 场景）=====
var vrInitialized = false;

function tryInitVR() {
    if (vrInitialized) return;
    // 检查是否已定位到 3D 场景区域（hash 匹配）
    if (window.location.hash !== '#solarSystemVR') return;

    vrInitialized = true;

    // 显示加载指示器
    var loadingEl = document.querySelector('#vrContainer #loadingIndicator');
    if (loadingEl) loadingEl.style.display = '';

    initVR();
    // 自动进入全屏沉浸模式（可被用户退出）
    setTimeout(function() {
        var fsBtn = document.getElementById('fullscreenBtn');
        if (fsBtn && !SPACEDEMO.isFullscreen) {
            fsBtn.click();
        }
    }, 800);
}

document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    // 不自动初始化 3D，等待用户进入
    tryInitVR();
});

// 监听 hash 变化（点击"进入太阳系"链接触发）
window.addEventListener('hashchange', function() {
    tryInitVR();
});

    // 公开接口
    SPACEDEMO.initVR = initVR;
    // initVR 内部有 window.initVR = initVR 的赋值
})(window.SPACEDEMO || (window.SPACEDEMO = {}), window, document, window.THREE);
