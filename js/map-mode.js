// ===== 太空探索博物馆 - 高德地图模式 =====
// 进入/退出地图模式，高德 JS API 动态加载

var mapInstance = null;
var mapDom = null;

function canEnterMapMode() {
    if (!SPACEDEMO.focusedPlanet || SPACEDEMO.focusedPlanet.data.name !== '地球') return false;
    var dist = SPACEDEMO.camera.position.distanceTo(SPACEDEMO.controls.target);
    return dist < 12;
}

function openMapMode() {
    if (SPACEDEMO.mapModeActive) return;
    SPACEDEMO.mapModeActive = true;

    // 全屏遮罩
    mapDom = document.createElement('div');
    mapDom.id = 'mapContainer';
    mapDom.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:3000;' +
        'background:#0a0a1a;display:flex;flex-direction:column;';

    // 顶部栏
    var topBar = document.createElement('div');
    topBar.style.cssText = 'padding:12px 20px;background:rgba(0,10,30,0.95);' +
        'border-bottom:1px solid rgba(0,200,255,0.2);display:flex;align-items:center;gap:12px;z-index:3001;';
    topBar.innerHTML = '<span style="color:#00ddff;font-size:16px;">🗺️ 太空探索博物馆 — 地图模式</span>';

    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕ 返回太空';
    closeBtn.style.cssText = 'margin-left:auto;background:rgba(0,200,255,0.15);border:1px solid rgba(0,200,255,0.3);' +
        'color:#00ddff;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:13px;';
    closeBtn.onclick = exitMapMode;
    topBar.appendChild(closeBtn);

    // 地图容器
    var mapDiv = document.createElement('div');
    mapDiv.id = 'amapContainer';
    mapDiv.style.cssText = 'flex:1;width:100%;';

    mapDom.appendChild(topBar);
    mapDom.appendChild(mapDiv);
    document.body.appendChild(mapDom);

    // 隐藏其他 UI 元素的逻辑
    document.querySelectorAll('#labelToggle, #fullscreenBtn, #enterMapBtn, #timePanel, #zoomSlider, #zoomValue, #tipBar, .planet-label')
        .forEach(function(el) {
            if (el) el.style.display = 'none';
        });
    document.getElementById('planetCard').style.bottom = '-400px';

    // 加载高德地图
    var key = localStorage.getItem('amap_key') || '';
    if (!key) {
        // 引导输入
        var input = document.createElement('div');
        input.id = 'keyInput';
        input.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
            'z-index:3002;background:rgba(0,10,30,0.95);border:1px solid #00ddff;border-radius:12px;' +
            'padding:24px;text-align:center;max-width:340px;width:90%;';
        input.innerHTML = '<p style="color:#00ddff;margin:0 0 12px;font-size:14px;">🗺️ 地图需要高德 API Key</p>' +
            '<input id="amapKeyInput" placeholder="请输入高德 Web端 JS API Key" style="width:90%;padding:8px;border-radius:6px;' +
            'border:1px solid #334;background:#0a0a2a;color:#fff;text-align:center;margin-bottom:10px;">' +
            '<br><button onclick="saveAmapKey()" style="background:#00ddff;border:none;color:#000;padding:8px 24px;border-radius:6px;cursor:pointer;">确认</button>' +
            '<p style="color:#556677;font-size:11px;margin:8px 0 0;">Key 仅保存在浏览器本地，不会上传</p>';
        mapDom.appendChild(input);
        window.saveAmapKey = function() {
            var k = document.getElementById('amapKeyInput').value.trim();
            if (k) {
                localStorage.setItem('amap_key', k);
                document.getElementById('keyInput').remove();
                loadAmap(k);
            }
        };
    } else {
        loadAmap(key);
    }

    // 更新按钮状态
    updateEnterMapButton();
}

function loadAmap(key) {
    // 加载高德 JS API
    var script = document.createElement('script');
    script.src = 'https://webapi.amap.com/maps?v=2.0&key=' + key;
    script.onload = function() {
        initAmapMap();
    };
    script.onerror = function() {
        var mapDiv = document.getElementById('amapContainer');
        if (mapDiv) {
            mapDiv.innerHTML = '<div style="text-align:center;padding:40px;color:#ff6644;">' +
                '❌ 地图加载失败。<br>请检查 Key 是否已在<a href="https://lbs.amap.com/" target="_blank" style="color:#00ddff;">高德开放平台</a>' +
                '将「服务平台」设置为 <b>Web端(JS API)</b>，并添加安全域名 <b>yexuejc.github.io</b></div>';
        }
    };
    document.head.appendChild(script);
}

function initAmapMap() {
    if (typeof AMap === 'undefined') {
        document.getElementById('amapContainer').innerHTML =
            '<div style="text-align:center;padding:40px;color:#ff6644;">❌ 高德地图 SDK 未加载成功</div>';
        return;
    }
    try {
        mapInstance = new AMap.Map('amapContainer', {
            zoom: 14,
            center: [116.397428, 39.90923], // 天安门
            viewMode: '3D',
            pitch: 45,
            mapStyle: 'amap://styles/light'
        });

        // 添加标记
        var marker = new AMap.Marker({
            position: [116.397428, 39.90923],
            title: '北京 · 天安门',
            label: { content: '📍 天安门', direction: 'top' }
        });
        mapInstance.add(marker);

        // 添加几个太空主题标记点
        var spaceMarkers = [
            { pos: [116.39123, 39.90726], name: '故宫' },
            { pos: [116.3455, 39.9885], name: '北京航天城' },
            { pos: [116.397, 39.915], name: '国家博物馆' }
        ];
        spaceMarkers.forEach(function(m) {
            var mk = new AMap.Marker({
                position: m.pos,
                title: m.name
            });
            mapInstance.add(mk);
        });

        // 类型切换
        var typeSwitch = document.createElement('div');
        typeSwitch.style.cssText = 'position:absolute;bottom:30px;right:20px;z-index:3003;' +
            'display:flex;gap:6px;';
        var layers = [
            { name: '标准', layer: null },
            { name: '卫星', layer: new AMap.TileLayer.Satellite() },
            { name: '路网', layer: new AMap.TileLayer.RoadNet() }
        ];
        layers.forEach(function(l, idx) {
            var btn = document.createElement('button');
            btn.textContent = l.name;
            btn.style.cssText = 'background:' + (idx === 0 ? 'rgba(0,200,255,0.3)' : 'rgba(0,10,30,0.7)') + ';' +
                'border:1px solid rgba(0,200,255,0.3);color:#00ddff;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:12px;';
            btn.onclick = function() {
                mapInstance.setLayers(l.layer ? [l.layer] : []);
                document.querySelectorAll('#mapContainer button').forEach(function(b) {
                    b.style.background = 'rgba(0,10,30,0.7)';
                });
                btn.style.background = 'rgba(0,200,255,0.3)';
            };
            typeSwitch.appendChild(btn);
        });
        mapDom.appendChild(typeSwitch);

        // 定位用户
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos) {
                mapInstance.setCenter([pos.coords.longitude, pos.coords.latitude]);
                var myMarker = new AMap.Marker({
                    position: [pos.coords.longitude, pos.coords.latitude],
                    title: '我的位置',
                    icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png'
                });
                mapInstance.add(myMarker);
            }, function() {}, { timeout: 5000 });
        }
    } catch (e) {
        document.getElementById('amapContainer').innerHTML =
            '<div style="text-align:center;padding:40px;color:#ff6644;">❌ 地图初始化失败: ' + e.message + '</div>';
    }
}

function exitMapMode() {
    if (!SPACEDEMO.mapModeActive) return;
    SPACEDEMO.mapModeActive = false;
    if (mapDom) {
        mapDom.remove();
        mapDom = null;
    }
    mapInstance = null;

    // 恢复 UI 元素
    document.querySelectorAll('#labelToggle, #fullscreenBtn, #enterMapBtn, #timePanel, #tipBar')
        .forEach(function(el) {
            if (el) el.style.display = '';
        });
    var zoomSlider = document.getElementById('zoomSlider');
    var zoomValue = document.getElementById('zoomValue');
    if (zoomSlider) zoomSlider.style.display = '';
    if (zoomValue) zoomValue.style.display = '';
    // 恢复标签
    if (SPACEDEMO.labelsVisible) {
        SPACEDEMO.labelObjects.forEach(function(lo) {
            lo.div.style.display = '';
        });
    }

    updateEnterMapButton();
}

function setupMapModeButton() {
    var btn = document.createElement('button');
    btn.id = 'enterMapBtn';
    btn.innerHTML = '🗺️';
    btn.title = '进入地图模式（需聚焦地球并拉近）';
    btn.style.cssText = 'position:fixed;top:70px;right:20px;z-index:1500;' +
        'background:rgba(0,20,40,0.7);border:1px solid rgba(0,200,255,0.3);color:#445566;' +
        'padding:8px 12px;border-radius:8px;cursor:pointer;font-size:18px;' +
        'backdrop-filter:blur(6px);opacity:0.4;pointer-events:none;transition:all 0.3s;';
    btn.onclick = function() {
        if (SPACEDEMO.mapModeActive) {
            exitMapMode();
        } else if (canEnterMapMode()) {
            openMapMode();
        }
    };
    document.body.appendChild(btn);
}

function updateEnterMapButton() {
    var btn = document.getElementById('enterMapBtn');
    if (!btn) return;
    if (SPACEDEMO.mapModeActive) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        btn.style.borderColor = 'rgba(255,100,0,0.5)';
        btn.style.color = '#ff8800';
        btn.title = '退出地图模式';
        return;
    }
    var can = canEnterMapMode();
    btn.style.opacity = can ? '1' : '0.4';
    btn.style.pointerEvents = can ? 'auto' : 'none';
    btn.style.color = can ? '#00ddff' : '#445566';
    btn.style.borderColor = can ? 'rgba(0,200,255,0.5)' : 'rgba(0,200,255,0.3)';
    btn.title = can ? '点击进入地图模式' : '需聚焦地球并拉近';
}
