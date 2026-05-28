// ===== 太空探索博物馆 - 界面交互模块 =====
// 行星信息卡片、标签切换、全屏沉浸、聚焦动画、缩放滑块、时间控制

// ===== 行星信息卡片 =====
(function initCard() {
    var card = document.createElement('div');
    card.id = 'planetCard';
    card.style.cssText = 'position:fixed;bottom:-400px;left:50%;transform:translateX(-50%);' +
        'background:rgba(0,10,30,0.92);border:1px solid rgba(0,200,255,0.3);border-radius:16px;' +
        'padding:20px 28px;z-index:2000;transition:bottom 0.5s cubic-bezier(0.34,1.56,0.64,1);' +
        'backdrop-filter:blur(12px);max-width:420px;width:90%;text-align:center;' +
        'box-shadow:0 8px 40px rgba(0,0,0,0.6);';
    card.innerHTML = '<div id="cardIcon" style="font-size:36px;margin-bottom:4px;"></div>' +
        '<h3 id="cardTitle" style="margin:0;color:#00ddff;font-size:18px;"></h3>' +
        '<p id="cardDesc" style="margin:8px 0 0;color:#8899aa;font-size:14px;line-height:1.5;"></p>' +
        '<p id="cardEnDesc" style="margin:4px 0 0;color:#556677;font-size:12px;font-style:italic;"></p>' +
        '<span style="position:absolute;top:8px;right:12px;color:#445566;cursor:pointer;font-size:16px;" onclick="hidePlanetCard()">✕</span>';
    document.body.appendChild(card);
    if (typeof hidePlanetCard === 'undefined') {
        window.hidePlanetCard = function() {
            document.getElementById('planetCard').style.bottom = '-400px';
        };
    }
    window.showPlanetCard = function(p) {
        var card = document.getElementById('planetCard');
        document.getElementById('cardIcon').textContent = p.icon;
        document.getElementById('cardTitle').textContent = p.name;
        document.getElementById('cardDesc').textContent = p.info.ch;
        document.getElementById('cardEnDesc').textContent = p.info.en;
        card.style.bottom = '20px';
        // 语音解说
        if (typeof speakPlanet === 'function') {
            speakPlanet(p);
        }
    };
})();

// ===== 标签切换按钮 =====
function setupLabelsToggle() {
    var btn = document.createElement('button');
    btn.id = 'labelToggle';
    btn.innerHTML = '🏷️';
    btn.title = '切换名称标注';
    btn.style.cssText = 'position:fixed;top:110px;right:20px;z-index:1500;' +
        'background:rgba(0,20,40,0.7);border:1px solid rgba(0,200,255,0.3);color:#00ddff;' +
        'padding:8px 12px;border-radius:8px;cursor:pointer;font-size:18px;' +
        'backdrop-filter:blur(6px);';
    btn.onclick = function() {
        SPACEDEMO.labelsVisible = !SPACEDEMO.labelsVisible;
        SPACEDEMO.labelObjects.forEach(function(lo) {
            lo.div.style.display = SPACEDEMO.labelsVisible ? '' : 'none';
        });
        btn.style.borderColor = SPACEDEMO.labelsVisible ? 'rgba(0,200,255,0.3)' : 'rgba(255,100,0,0.5)';
        btn.style.color = SPACEDEMO.labelsVisible ? '#00ddff' : '#ff8800';
    };
    document.body.appendChild(btn);
}

// ===== 全屏沉浸按钮 =====
function setupFullscreenToggle() {
    var btn = document.createElement('button');
    btn.id = 'fullscreenBtn';
    btn.innerHTML = '⛶';
    btn.title = '全屏沉浸模式';
    btn.style.cssText = 'position:fixed;top:20px;right:20px;z-index:1500;' +
        'background:rgba(0,20,40,0.7);border:1px solid rgba(0,200,255,0.3);color:#00ddff;' +
        'padding:8px 12px;border-radius:8px;cursor:pointer;font-size:20px;' +
        'backdrop-filter:blur(6px);';
    btn.onclick = function() {
        SPACEDEMO.isFullscreen = !SPACEDEMO.isFullscreen;
        var container = SPACEDEMO.container;
        if (SPACEDEMO.isFullscreen) {
            container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:2000;';
            btn.innerHTML = '⛶';
            btn.style.color = '#ff8800';
        } else {
            container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;';
            btn.innerHTML = '⛶';
            btn.style.color = '#00ddff';
        }
        SPACEDEMO.renderer.setSize(window.innerWidth, window.innerHeight);
        if (SPACEDEMO.labelRenderer) {
            SPACEDEMO.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        }
        SPACEDEMO.camera.aspect = window.innerWidth / window.innerHeight;
        SPACEDEMO.camera.updateProjectionMatrix();
    };
    document.body.appendChild(btn);
}

// ===== 聚焦环 + 聚焦/复位逻辑 =====
function focusOnPlanet(planetEntry) {
    var target = planetEntry.mesh.position.clone();
    var camTarget = new THREE.Vector3(
        target.x + planetEntry.data.radius * 3,
        target.y + planetEntry.data.radius * 2,
        target.z + planetEntry.data.radius * 3
    );
    SPACEDEMO.focusAnim = {
        startTarget: SPACEDEMO.controls.target.clone(),
        endTarget: target,
        startCam: SPACEDEMO.camera.position.clone(),
        endCam: camTarget,
        progress: 0
    };
    SPACEDEMO.focusedPlanet = planetEntry;
    // 缩放滑块同步到目标距离
    var dist = planetEntry.data.radius * 4;
    SPACEDEMO.targetZoomDist = dist;
    var sliderVal = zoomToSlider(dist);
    var slider = document.getElementById('zoomSlider');
    if (slider) slider.value = sliderVal;
    // 隐藏提示栏
    var tipBar = document.getElementById('tipBar');
    if (tipBar) tipBar.style.opacity = '0';
    // 导航高亮
    if (typeof highlightNav === 'function') highlightNav(planetEntry.data.name);
}

function resetFocus() {
    SPACEDEMO.focusAnim = {
        startTarget: SPACEDEMO.controls.target.clone(),
        endTarget: new THREE.Vector3(0, 0, 0),
        startCam: SPACEDEMO.camera.position.clone(),
        endCam: new THREE.Vector3(0, 60, 100),
        progress: 0
    };
    SPACEDEMO.focusedPlanet = null;
    SPACEDEMO.targetZoomDist = 100;
    var sliderVal = zoomToSlider(100);
    var slider = document.getElementById('zoomSlider');
    if (slider) slider.value = sliderVal;
    var tipBar = document.getElementById('tipBar');
    if (tipBar) tipBar.style.opacity = '1';
    // 清除导航高亮
    if (typeof clearNavHighlight === 'function') clearNavHighlight();
}

// ===== 缩放滑块 =====
function setupZoomSlider() {
    var container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:16px;top:50%;transform:translateY(-50%);' +
        'z-index:1500;display:flex;flex-direction:column;align-items:center;gap:4px;' +
        'background:rgba(0,10,30,0.6);padding:10px 6px;border-radius:12px;' +
        'border:1px solid rgba(0,200,255,0.15);backdrop-filter:blur(6px);';

    var label = document.createElement('div');
    label.textContent = '🔍';
    label.style.cssText = 'color:#00ddff;font-size:14px;text-align:center;';

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'zoomSlider';
    slider.min = 0; slider.max = 1000; slider.value = zoomToSlider(100);
    slider.style.cssText = 'writing-mode:vertical-lr;direction:rtl;' +
        'width:8px;height:180px;cursor:pointer;accent-color:#00ffff;' +
        'background:linear-gradient(to bottom,#00ffff,#333);border-radius:4px;outline:none;margin:4px 0;';

    var valueLabel = document.createElement('div');
    valueLabel.id = 'zoomValue';
    valueLabel.textContent = '36%';
    valueLabel.style.cssText = 'color:#8899aa;font-size:11px;text-align:center;font-family:monospace;';

    container.appendChild(label);
    container.appendChild(slider);
    container.appendChild(valueLabel);
    document.body.appendChild(container);

    slider.addEventListener('input', function() {
        zoomFromSlider = true;
        var dist = sliderToZoom(parseInt(this.value));
        SPACEDEMO.targetZoomDist = dist;
        // 更新百分比显示
        var pct = Math.round((1 - (dist - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)) * 100);
        document.getElementById('zoomValue').textContent = pct + '%';
    });
}

// ===== 时间控制面板 =====
function setupTimeControls() {
    var panel = document.createElement('div');
    panel.id = 'timePanel';
    panel.style.cssText = 'position:fixed;bottom:70px;left:50%;transform:translateX(-50%);' +
        'z-index:1500;display:flex;align-items:center;gap:10px;' +
        'background:rgba(0,10,30,0.7);border:1px solid rgba(0,200,255,0.2);' +
        'padding:8px 16px;border-radius:20px;backdrop-filter:blur(6px);';

    var pauseBtn = document.createElement('button');
    pauseBtn.id = 'pauseBtn';
    pauseBtn.innerHTML = '⏸';
    pauseBtn.style.cssText = 'background:none;border:none;color:#00ddff;font-size:18px;cursor:pointer;padding:4px;';
    pauseBtn.onclick = function() {
        isPaused = !isPaused;
        pauseBtn.innerHTML = isPaused ? '▶' : '⏸';
        pauseBtn.style.color = isPaused ? '#ff8800' : '#00ddff';
    };

    var speedLabel = document.createElement('span');
    speedLabel.style.cssText = 'color:#8899aa;font-size:12px;min-width:28px;';
    speedLabel.textContent = '1×';

    var speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = -200; speedSlider.max = 300; speedSlider.value = 0;
    speedSlider.style.cssText = 'width:120px;accent-color:#00ffff;cursor:pointer;';
    speedSlider.oninput = function() {
        var v = parseInt(this.value);
        if (v === 0) { speedMultiplier = 1; speedLabel.textContent = '1×'; }
        else if (v < 0) { speedMultiplier = Math.pow(10, v / 100); speedLabel.textContent = speedMultiplier.toFixed(2) + '×'; }
        else { speedMultiplier = Math.pow(10, v / 100); speedLabel.textContent = speedMultiplier.toFixed(0) + '×'; }
    };

    var dateLabel = document.createElement('span');
    dateLabel.id = 'dateLabel';
    dateLabel.style.cssText = 'color:#445566;font-size:10px;font-family:monospace;min-width:120px;text-align:center;';

    panel.appendChild(pauseBtn);
    panel.appendChild(speedSlider);
    panel.appendChild(speedLabel);
    panel.appendChild(dateLabel);
    document.body.appendChild(panel);
}

function updateDateLabel() {
    var el = document.getElementById('dateLabel');
    if (el) {
        var d = getSimDate();
        el.textContent = d.getUTCFullYear() + '-' +
            String(d.getUTCMonth()+1).padStart(2,'0') + '-' +
            String(d.getUTCDate()).padStart(2,'0') + ' ' +
            String(d.getUTCHours()).padStart(2,'0') + ':' +
            String(d.getUTCMinutes()).padStart(2,'0');
    }
}

// ===== 提示栏 =====
function setupTipBar() {
    var bar = document.createElement('div');
    bar.id = 'tipBar';
    bar.innerHTML = '🖱️ 单击行星查看信息 · 双击聚焦追踪 · 滚轮缩放 · 🗺️ 聚焦地球拉近进入地图';
    bar.style.cssText = 'position:fixed;bottom:115px;left:50%;transform:translateX(-50%);' +
        'z-index:1400;color:#445566;font-size:12px;text-align:center;' +
        'background:rgba(0,10,30,0.5);padding:6px 16px;border-radius:12px;' +
        'transition:opacity 0.5s;white-space:nowrap;';
    document.body.appendChild(bar);
}

// ===== 交互事件 =====
function setupInteractionEvents() {
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var lastClickTime = 0;
    var lastClickPos = { x: 0, y: 0 };

    SPACEDEMO.renderer.domElement.addEventListener('click', function(event) {
        var now = Date.now();
        var rect = SPACEDEMO.renderer.domElement.getBoundingClientRect();
        var mx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        var my = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // 检测双击
        var timeDelta = now - lastClickTime;
        var distDelta = Math.sqrt(
            Math.pow(event.clientX - lastClickPos.x, 2) +
            Math.pow(event.clientY - lastClickPos.y, 2)
        );
        lastClickTime = now;
        lastClickPos.x = event.clientX;
        lastClickPos.y = event.clientY;

        if (timeDelta < 400 && distDelta < 10) {
            // 双击
            mouse.x = mx; mouse.y = my;
            raycaster.setFromCamera(mouse, SPACEDEMO.camera);
            var intersects = raycaster.intersectObjects(SPACEDEMO.clickables);
            if (intersects.length > 0) {
                var hit = intersects[0].object;
                if (hit.userData && hit.userData.name) {
                    // 双击行星
                    SPACEDEMO.planets.forEach(function(p) {
                        if (p.data.name === hit.userData.name) {
                            if (SPACEDEMO.focusedPlanet && SPACEDEMO.focusedPlanet.data.name === p.data.name) {
                                // 已聚焦则复位
                                resetFocus();
                            } else {
                                focusOnPlanet(p);
                            }
                        }
                    });
                    return;
                }
            }
            // 双击空白 → 复位
            resetFocus();
            return;
        }

        // 单击
        mouse.x = mx; mouse.y = my;
        raycaster.setFromCamera(mouse, SPACEDEMO.camera);
        var intersects = raycaster.intersectObjects(SPACEDEMO.clickables);
        if (intersects.length > 0) {
            var hit = intersects[0].object;
            // 星座点击检测
            if (hit.userData && hit.userData.isConstellation) {
                if (typeof showConstellationInfo === 'function') {
                    showConstellationInfo(hit.userData.constellationIdx);
                }
                return;
            }
            // 行星点击检测
            if (hit.userData && hit.userData.name) {
                SPACEDEMO.planets.forEach(function(p) {
                    if (p.data.name === hit.userData.name) {
                        showPlanetCard(p.data);
                    }
                });
            }
        }
    });

    // ESC 退出聚焦
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (SPACEDEMO.mapModeActive) {
                exitMapMode();
            } else if (SPACEDEMO.focusedPlanet) {
                resetFocus();
            } else if (SPACEDEMO.isFullscreen) {
                document.getElementById('fullscreenBtn').onclick();
            }
        }
    });
}

// ===== 自适应（使用 ResizeObserver）=====
function setupResizeHandler() {
    var container = SPACEDEMO.container;
    var ro = new ResizeObserver(function() {
        var cw = container.clientWidth, ch = container.clientHeight;
        if (cw > 0 && ch > 0) {
            SPACEDEMO.camera.aspect = cw / ch;
            SPACEDEMO.camera.updateProjectionMatrix();
            SPACEDEMO.renderer.setSize(cw, ch);
            if (SPACEDEMO.labelRenderer) {
                SPACEDEMO.labelRenderer.setSize(cw, ch);
            }
        }
    });
    ro.observe(container);
}
