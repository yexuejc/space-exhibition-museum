// ===== 太空探索博物馆 - 界面交互模块 =====
// 行星信息卡片、标签切换、全屏沉浸、聚焦动画、缩放滑块、时间控制

// ===== 行星信息卡片（增强科学数据版）=====
(function initCard() {
    var card = document.createElement('div');
    card.id = 'planetCard';
    card.style.cssText = 'position:fixed;bottom:-500px;left:50%;transform:translateX(-50%);' +
        'background:rgba(0,8,25,0.95);border:1px solid rgba(0,200,255,0.25);border-radius:18px;' +
        'padding:0;z-index:2000;transition:bottom 0.5s cubic-bezier(0.34,1.56,0.64,1);' +
        'backdrop-filter:blur(16px);max-width:460px;width:92%;' +
        'box-shadow:0 8px 50px rgba(0,0,0,0.8),0 0 30px rgba(0,200,255,0.08);' +
        'overflow:hidden;max-height:80vh;overflow-y:auto;font-family:"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;';
    card.innerHTML =
        // 头部：图标+名称+关闭
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px 10px;border-bottom:1px solid rgba(0,200,255,0.1);">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
                '<span id="cardIcon" style="font-size:32px;width:40px;text-align:center;"></span>' +
                '<div>' +
                    '<h3 id="cardTitle" style="margin:0;color:#00ddff;font-size:18px;font-weight:600;"></h3>' +
                    '<span id="cardNameEn" style="color:#556677;font-size:11px;font-style:italic;"></span>' +
                '</div>' +
            '</div>' +
            '<span id="cardClose" style="color:#445566;cursor:pointer;font-size:18px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:all 0.2s;" ' +
            'onmouseover="this.style.background=\'rgba(255,255,255,0.1)\';this.style.color=\'#fff\'" ' +
            'onmouseout="this.style.background=\'transparent\';this.style.color=\'#445566\'" ' +
            'onclick="hidePlanetCard()">✕</span>' +
        '</div>' +
        // 简介
        '<div style="padding:10px 20px 6px;">' +
            '<p id="cardDesc" style="margin:0;color:#8899aa;font-size:13px;line-height:1.6;"></p>' +
        '</div>' +
        // 科学数据面板
        '<div id="cardSciData" style="padding:4px 20px 16px;"></div>';
    document.body.appendChild(card);

    // 全局关闭函数
    if (typeof hidePlanetCard === 'undefined') {
        window.hidePlanetCard = function() {
            document.getElementById('planetCard').style.bottom = '-500px';
        };
    }

    // 显示信息卡片
    window.showPlanetCard = function(p) {
        var card = document.getElementById('planetCard');
        document.getElementById('cardIcon').textContent = p.icon || '🪐';
        document.getElementById('cardTitle').textContent = p.name;
        document.getElementById('cardDesc').textContent = p.info && p.info.ch ? p.info.ch : '';

        // 英文名
        var enEl = document.getElementById('cardNameEn');
        if (p.info && p.info.en) {
            enEl.textContent = p.info.en;
            enEl.style.display = '';
        } else {
            enEl.style.display = 'none';
        }

        // 构建科学数据面板
        var sciContainer = document.getElementById('cardSciData');
        sciContainer.innerHTML = buildSciTable(p);

        card.style.bottom = '20px';

        // 语音解说
        if (typeof speakPlanet === 'function') {
            speakPlanet(p);
        }
    };

    // 构建科学数据表格HTML
    function buildSciTable(p) {
        var sci = p.sci;
        if (!sci) return '<div style="color:#556677;font-size:12px;text-align:center;padding:8px;">暂无详细数据</div>';

        var html = '';
        var categories = [
            {
                label: '📏 物理参数',
                rows: [
                    { label:'直径', val:sci.diameter },
                    { label:'质量', val:sci.mass },
                    { label:'重力', val:sci.gravity },
                    { label:'密度', val:sci.density, cond:true }
                ]
            },
            {
                label: '🌡️ 环境数据',
                rows: [
                    { label:'表面温度', val:sci.temp },
                    { label:'大气成分', val:sci.atmosphere },
                    { label:'卫星数量', val:sci.moons !== undefined ? sci.moons + ' 颗' : null }
                ]
            },
            {
                label: '🔄 轨道信息',
                rows: [
                    { label:'距太阳', val:sci.auDist !== undefined ? sci.auDist + ' AU' : null },
                    { label:'公转周期', val:sci.yearLength },
                    { label:'自转周期', val:sci.dayLength },
                    { label:'轴倾斜角', val:sci.axialTilt }
                ]
            },
            {
                label: '🔭 发现信息',
                rows: [
                    { label:'发现者', val:sci.discoverer },
                    { label:'发现年份', val:sci.discoverYear }
                ]
            }
        ];

        categories.forEach(function(cat) {
            // 过滤掉无数据的行
            var validRows = cat.rows.filter(function(r) { return r.val !== null && r.val !== undefined && r.val !== '—'; });
            if (validRows.length === 0) return;

            html += '<div style="margin-top:10px;">' +
                '<div style="color:#4488aa;font-size:11px;font-weight:600;margin-bottom:4px;letter-spacing:1px;">' + cat.label + '</div>';

            validRows.forEach(function(row) {
                html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.03);">' +
                    '<span style="color:#667788;font-size:12px;">' + row.label + '</span>' +
                    '<span style="color:#c0d0e0;font-size:12px;font-weight:500;font-family:\'Consolas\',monospace;">' + row.val + '</span>' +
                '</div>';
            });

            html += '</div>';
        });

        // 数据来源标注
        html += '<div style="margin-top:10px;padding-top:6px;border-top:1px solid rgba(0,200,255,0.08);text-align:center;color:#445566;font-size:10px;">' +
            '📡 数据来源：NASA 太阳系探索</div>';

        return html;
    }
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
        // 使用浏览器本地时区显示
        var tzName = '';
        try {
            tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            if (tzName) tzName = tzName.replace('_', ' ').split('/').pop();
        } catch(e) {}
        el.textContent = d.getFullYear() + '-' +
            String(d.getMonth()+1).padStart(2,'0') + '-' +
            String(d.getDate()).padStart(2,'0') + ' ' +
            String(d.getHours()).padStart(2,'0') + ':' +
            String(d.getMinutes()).padStart(2,'0') +
            (tzName ? ' ' + tzName : '');
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
                    var found = false;
                    SPACEDEMO.planets.forEach(function(p) {
                        if (p.data.name === hit.userData.name) {
                            found = true;
                            if (SPACEDEMO.focusedPlanet && SPACEDEMO.focusedPlanet.data.name === p.data.name) {
                                resetFocus();
                            } else {
                                focusOnPlanet(p);
                            }
                        }
                    });
                    // 双击冥王星
                    if (!found && SPACEDEMO.pluto && SPACEDEMO.pluto.data.name === hit.userData.name) {
                        if (SPACEDEMO.focusedPlanet && SPACEDEMO.focusedPlanet.data.name === SPACEDEMO.pluto.data.name) {
                            resetFocus();
                        } else {
                            focusOnPlanet(SPACEDEMO.pluto);
                        }
                        found = true;
                    }
                    // 双击彗星
                    if (!found && SPACEDEMO.comet && SPACEDEMO.comet.data.name === hit.userData.name) {
                        if (SPACEDEMO.focusedPlanet && SPACEDEMO.focusedPlanet.data.name === SPACEDEMO.comet.data.name) {
                            resetFocus();
                        } else {
                            focusOnPlanet(SPACEDEMO.comet);
                        }
                        found = true;
                    }
                    if (found) return;
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
                var found = false;
                SPACEDEMO.planets.forEach(function(p) {
                    if (p.data.name === hit.userData.name) {
                        showPlanetCard(p.data);
                        found = true;
                    }
                });
                // 单击冥王星
                if (!found && SPACEDEMO.pluto && SPACEDEMO.pluto.data.name === hit.userData.name) {
                    showPlanetCard(SPACEDEMO.pluto.data);
                    found = true;
                }
                // 单击彗星
                if (!found && SPACEDEMO.comet && SPACEDEMO.comet.data.name === hit.userData.name) {
                    showPlanetCard(SPACEDEMO.comet.data);
                    found = true;
                }
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
