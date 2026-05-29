// ===== 太空探索博物馆 - 高德地图模式 =====
// 支持自动无缝过渡：拉近地球 → 自动进入地图；缩小地图 → 自动回到最大地球
// 高德 JS API 动态加载

var mapInstance = null;
var mapDom = null;
var isMapLoading = false;
var lastMapExitTime = 0;
var MAP_AUTO_ENTER_DIST = 2.5; // 3D 相机距离地球多远时自动进入地图
var MAP_AUTO_EXIT_ZOOM = 12;   // 地图缩放低于多少时自动退出（回到太空）
var MAP_EXIT_COOLDOWN = 3000;  // 退出地图后冷却(ms)，防止闪回循环

// ===== 计算相机看地球的哪个面 =====
// 根据相机相对地球位置估算经度/纬度，用于地图居中
function getCameraEarthLookAt() {
    var earthEntry = null;
    SPACEDEMO.planets.forEach(function(p) {
        if (p.data.name === '地球') earthEntry = p;
    });
    if (!earthEntry) return [116.397428, 39.90923]; // 默认：北京

    var earthPos = earthEntry.mesh.position;
    var camPos = SPACEDEMO.camera.position;

    // 从地球指向相机的方向
    var dir = new THREE.Vector3().copy(camPos).sub(earthPos).normalize();

    // 获取地球自转角度（Three.js 中 UV 映射起点在 -Z 方向）
    var rotY = earthEntry.mesh.rotation.y;

    // 从方向向量反算经纬度（简化版）
    var theta = Math.atan2(-dir.z, -dir.x) + rotY;
    var phi = Math.asin(Math.max(-1, Math.min(1, dir.y)));

    var lng = (theta / Math.PI * 180);
    var lat = (phi / Math.PI * 180);

    // 修正经度范围
    lng = ((lng + 540) % 360) - 180;

    if (isNaN(lng) || isNaN(lat)) return [116.397428, 39.90923];

    return [parseFloat(lng.toFixed(4)), parseFloat(lat.toFixed(4))];
}

// ===== 检查是否能进入地图模式 =====
function canEnterMapMode() {
    if (!SPACEDEMO.focusedPlanet || SPACEDEMO.focusedPlanet.data.name !== '地球') return false;
    var dist = SPACEDEMO.camera.position.distanceTo(SPACEDEMO.controls.target);
    return dist < 12;
}

// ===== 进入地图模式（自动或手动）=====
function openMapMode() {
    if (SPACEDEMO.mapModeActive || isMapLoading) return;
    isMapLoading = true;
    SPACEDEMO.mapModeActive = true;

    // 获取相机当前看的地球区域
    var lookAt = getCameraEarthLookAt();

    // 全屏遮罩
    mapDom = document.createElement('div');
    mapDom.id = 'mapContainer';
    mapDom.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:3000;' +
        'background:#0a0a1a;display:flex;flex-direction:column;animation:mapFadeIn 0.3s ease;';

    // 顶部栏（精简，自动模式更低调）
    var topBar = document.createElement('div');
    topBar.style.cssText = 'padding:10px 16px;background:rgba(0,10,30,0.92);' +
        'border-bottom:1px solid rgba(0,200,255,0.15);display:flex;align-items:center;gap:8px;z-index:3001;';
    topBar.innerHTML = '<span style="color:#00ddff;font-size:14px;">🗺️ 地图模式 <span id="mapZoomLevel" style="color:#556677;font-size:11px;"></span></span>';

    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = 'margin-left:auto;background:rgba(0,200,255,0.1);border:1px solid rgba(0,200,255,0.2);' +
        'color:#00ddff;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:13px;' +
        'transition:all 0.2s;';
    closeBtn.onmouseover = function() { this.style.background = 'rgba(0,200,255,0.25)'; };
    closeBtn.onmouseout = function() { this.style.background = 'rgba(0,200,255,0.1)'; };
    closeBtn.onclick = function() {
        exitMapMode();
        // 手动关闭时回到比较近的视角
        var earthEntry = findEarth();
        if (earthEntry) positionCameraNearEarth(earthEntry, 4);
    };
    topBar.appendChild(closeBtn);

    // 地图容器
    var mapDiv = document.createElement('div');
    mapDiv.id = 'amapContainer';
    mapDiv.style.cssText = 'flex:1;width:100%;';

    mapDom.appendChild(topBar);
    mapDom.appendChild(mapDiv);
    document.body.appendChild(mapDom);

    // 隐藏 3D UI 元素
    document.querySelectorAll('#labelToggle, #fullscreenBtn, #enterMapBtn, #timePanel, #zoomSlider, #zoomValue, #tipBar, .planet-label')
        .forEach(function(el) {
            if (el) el.style.display = 'none';
        });
    document.getElementById('planetCard').style.bottom = '-1500px';

    // 添加淡入动画
    if (!document.getElementById('mapFadeStyle')) {
        var style = document.createElement('style');
        style.id = 'mapFadeStyle';
        style.textContent = '@keyframes mapFadeIn { from { opacity:0; transform:scale(1.05); } to { opacity:1; transform:scale(1); } }';
        document.head.appendChild(style);
    }

    // 尝试定位用户位置
    var userPos = null;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
            userPos = [pos.coords.longitude, pos.coords.latitude];
            // 地图已经初始化的话就移动过去
            if (mapInstance) {
                mapInstance.setCenter(userPos);
                addUserMarker(userPos);
            }
        }, function() {}, { timeout: 3000 });
    }

    // 加载高德地图
    var key = localStorage.getItem('amap_key') || '';
    if (!key) {
        showKeyInput(lookAt);
    } else {
        loadAmap(key, lookAt, userPos);
    }

    updateEnterMapButton();
    isMapLoading = false;
}

function findEarth() {
    var result = null;
    SPACEDEMO.planets.forEach(function(p) {
        if (p.data.name === '地球') result = p;
    });
    return result;
}

function showKeyInput(lookAt) {
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
            loadAmap(k, lookAt, null);
        }
    };
}

function loadAmap(key, lookAt, userPos) {
    var script = document.createElement('script');
    script.src = 'https://webapi.amap.com/maps?v=2.0&key=' + key;
    script.onload = function() {
        initAmapMap(lookAt, userPos);
    };
    script.onerror = function() {
        document.getElementById('amapContainer').innerHTML =
            '<div style="text-align:center;padding:60px 20px;color:#ff6644;">' +
            '❌ 地图加载失败。<br>请检查 Key 是否已在<a href="https://lbs.amap.com/" target="_blank" style="color:#00ddff;">高德开放平台</a>' +
            '将「服务平台」设置为 <b>Web端(JS API)</b>，并添加安全域名 <b>yexuejc.github.io</b></div>';
    };
    document.head.appendChild(script);
}

function initAmapMap(lookAt, userPos) {
    if (typeof AMap === 'undefined') {
        document.getElementById('amapContainer').innerHTML =
            '<div style="text-align:center;padding:60px;color:#ff6644;">❌ 高德地图 SDK 未加载成功</div>';
        return;
    }
    try {
        // 使用相机看的地球区域作为地图初始中心
        var center = userPos || lookAt || [116.397428, 39.90923];

        mapInstance = new AMap.Map('amapContainer', {
            zoom: 14,
            center: center,
            viewMode: '3D',
            pitch: 45,
            mapStyle: 'amap://styles/light',
            showIndoorMap: false
        });

        // 更新缩放级别显示
        updateMapZoomDisplay();

        // ===== 监听地图缩放事件（用于自动退出）=====
        mapInstance.on('zoomend', function() {
            updateMapZoomDisplay();
            var zoom = mapInstance.getZoom();
            // 当缩放级别低于阈值时，自动返回太空
            if (zoom < MAP_AUTO_EXIT_ZOOM) {
                exitMapMode();
                // 定位相机到地球近轨，让地球占满视野
                var earthEntry = findEarth();
                if (earthEntry) positionCameraNearEarth(earthEntry, 2.5);
            }
        });

        // 添加用户位置标记
        if (userPos) addUserMarker(userPos);

        // ===== 丰富POI标记（带信息弹窗）=====
        var pois = [
            {
                pos: [116.397428, 39.90923],
                name: '天安门广场',
                en: 'Tiananmen Square',
                icon: '🏛️',
                desc: '天安门广场是世界上最大的城市广场，是中国的国家象征和重要政治活动场所。',
                descEn: 'The world\'s largest city square, national symbol of China and venue for major ceremonies.'
            },
            {
                pos: [116.39123, 39.90726],
                name: '故宫博物院',
                en: 'The Forbidden City',
                icon: '🏯',
                desc: '明清两代的皇家宫殿，是世界上现存规模最大、保存最完整的木质结构古建筑群。',
                descEn: 'Imperial palace of Ming and Qing dynasties, the world\'s largest and best-preserved wooden palace complex.'
            },
            {
                pos: [116.3455, 39.9885],
                name: '北京航天城',
                en: 'Beijing Space City',
                icon: '🚀',
                desc: '中国载人航天工程指挥中心和航天员训练基地，中国航天的核心所在地。',
                descEn: 'China\'s manned space program command center and astronaut training base.'
            },
            {
                pos: [116.397, 39.915],
                name: '国家博物馆',
                en: 'National Museum of China',
                icon: '🏛️',
                desc: '世界上最大的博物馆之一，展示中华五千年文明史。',
                descEn: 'One of the world\'s largest museums, showcasing 5,000 years of Chinese civilization.'
            },
            {
                pos: [116.3905, 39.9929],
                name: '国家体育场（鸟巢）',
                en: 'Bird\'s Nest Stadium',
                icon: '🏟️',
                desc: '2008年北京奥运会主体育场，造型如同鸟巢，是现代建筑奇观。',
                descEn: 'Main stadium of 2008 Beijing Olympics, designed like a bird\'s nest, a modern architectural wonder.'
            },
            {
                pos: [116.3929, 39.9911],
                name: '国家游泳中心（水立方）',
                en: 'Water Cube',
                icon: '💧',
                desc: '2008年北京奥运会游泳比赛场馆，独特的泡泡造型设计。',
                descEn: 'Aquatics venue for 2008 Beijing Olympics, famous for its bubble-shaped design.'
            },
            {
                pos: [116.2349, 40.3451],
                name: '慕田峪长城',
                en: 'Mutianyu Great Wall',
                icon: '🧱',
                desc: '明代长城的精华段落之一，保存完好，景色壮丽，有\"万里长城慕田峪独秀\"之称。',
                descEn: 'One of the best-preserved sections of the Ming Great Wall, known for spectacular mountain views.'
            },
            {
                pos: [116.2839, 39.9997],
                name: '颐和园',
                en: 'Summer Palace',
                icon: '🌿',
                desc: '中国古典园林的巅峰之作，以昆明湖和万寿山为核心，被誉为\"皇家园林博物馆\"。',
                descEn: 'Masterpiece of Chinese classical garden design, centered on Kunming Lake and Longevity Hill.'
            },
            {
                pos: [116.4434, 39.9048],
                name: '中国科学技术馆',
                en: 'China Science & Technology Museum',
                icon: '🔬',
                desc: '展示中国科技成就的大型科普教育基地，包含航天、人工智能等主题展厅。',
                descEn: 'Major science education center showcasing China\'s technological achievements including space and AI.'
            }
        ];

        pois.forEach(function(poi) {
            var markerContent = document.createElement('div');
            markerContent.style.cssText = 'background:rgba(0,15,40,0.85);border:1px solid rgba(0,200,255,0.3);' +
                'border-radius:8px;padding:4px 10px;cursor:pointer;' +
                'backdrop-filter:blur(4px);transition:all 0.2s;' +
                'box-shadow:0 2px 12px rgba(0,0,0,0.4);';
            markerContent.innerHTML = '<span style="font-size:16px;">' + poi.icon + '</span> ' +
                '<span style="color:#00ddff;font-size:12px;">' + poi.name + '</span>';

            var marker = new AMap.Marker({
                position: poi.pos,
                content: markerContent,
                offset: new AMap.Pixel(-50, -15)
            });
            mapInstance.add(marker);

            // 信息弹窗
            var infoWin = new AMap.InfoWindow({
                content: '<div style="background:rgba(0,10,30,0.95);border:1px solid rgba(0,200,255,0.25);' +
                    'border-radius:12px;padding:14px 18px;max-width:260px;' +
                    'backdrop-filter:blur(8px);">' +
                    '<div style="font-size:22px;margin-bottom:4px;">' + poi.icon + '</div>' +
                    '<div style="color:#00ddff;font-size:15px;font-weight:600;margin-bottom:2px;">' + poi.name + '</div>' +
                    '<div style="color:#556677;font-size:11px;margin-bottom:6px;">' + poi.en + '</div>' +
                    '<div style="color:#99aabb;font-size:12px;line-height:1.5;">' + poi.desc + '</div>' +
                    '</div>',
                offset: new AMap.Pixel(0, -30),
                size: new AMap.Size(0, 0)
            });

            marker.on('click', function() {
                infoWin.open(mapInstance, marker.getPosition());
            });

            // 鼠标移入移出效果
            markerContent.onmouseover = function() {
                this.style.borderColor = 'rgba(0,200,255,0.6)';
                this.style.background = 'rgba(0,25,60,0.9)';
            };
            markerContent.onmouseout = function() {
                this.style.borderColor = 'rgba(0,200,255,0.3)';
                this.style.background = 'rgba(0,15,40,0.85)';
            };
        });

        // 类型切换按钮
        setupMapTypeSwitcher();

        // 提示条：滚动退出
        showMapTip();

    } catch (e) {
        document.getElementById('amapContainer').innerHTML =
            '<div style="text-align:center;padding:60px;color:#ff6644;">❌ 地图初始化失败: ' + e.message + '</div>';
    }
}

function addUserMarker(pos) {
    if (!mapInstance) return;
    var myMarker = new AMap.Marker({
        position: pos,
        title: '我的位置',
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png'
    });
    mapInstance.add(myMarker);
}

function updateMapZoomDisplay() {
    var el = document.getElementById('mapZoomLevel');
    if (el && mapInstance) {
        var zoom = mapInstance.getZoom();
        el.textContent = zoom >= 18 ? '🛰️ 街景级' :
                         zoom >= 14 ? '🏙️ 城市级' :
                         zoom >= 10 ? '🌆 区域级' : '🌍 大陆级';
    }
}

function setupMapTypeSwitcher() {
    var typeSwitch = document.createElement('div');
    typeSwitch.style.cssText = 'position:absolute;bottom:30px;right:20px;z-index:3003;' +
        'display:flex;gap:6px;';

    var currentLayer = null; // 当前激活的自定义图层
    var layers = [
        { name: '标准', layer: null },
        { name: '卫星', layer: new AMap.TileLayer.Satellite() },
        { name: '路网', layer: new AMap.TileLayer.RoadNet() }
    ];

    layers.forEach(function(l, idx) {
        var btn = document.createElement('button');
        btn.textContent = l.name;
        btn.style.cssText = 'background:' + (idx === 0 ? 'rgba(0,200,255,0.3)' : 'rgba(0,10,30,0.7)') + ';' +
            'border:1px solid rgba(0,200,255,0.3);color:#00ddff;padding:4px 12px;border-radius:6px;' +
            'cursor:pointer;font-size:12px;transition:all 0.2s;';
        btn.onmouseover = function() { this.style.background = 'rgba(0,200,255,0.2)'; };
        btn.onmouseout = function() {
            this.style.background = this === btnActiveRef ? 'rgba(0,200,255,0.3)' : 'rgba(0,10,30,0.7)';
        };
        var btnActiveRef = btn; // 闭包引用
        btn.onclick = function() {
            // 清除之前的自定义图层
            if (currentLayer) {
                mapInstance.remove(currentLayer);
                currentLayer = null;
            }
            // 添加新图层（null表示标准底图无需额外图层）
            if (l.layer) {
                mapInstance.add(l.layer);
                currentLayer = l.layer;
            }
            // 更新按钮样式
            typeSwitch.querySelectorAll('button').forEach(function(b) {
                b.style.background = 'rgba(0,10,30,0.7)';
            });
            this.style.background = 'rgba(0,200,255,0.3)';
        };
        typeSwitch.appendChild(btn);
    });
    mapDom.appendChild(typeSwitch);

    // 比例尺控件
    var scale = new AMap.Scale();
    mapInstance.addControl(scale);

    // 工具条（缩放+定位）
    var toolbar = new AMap.ToolBar({
        position: 'LT',           // 左上角
        offset: new AMap.Pixel(16, 60),
        ruler: true,
        noIpLocate: true
    });
    mapInstance.addControl(toolbar);
}

function showMapTip() {
    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;bottom:80px;left:50%;transform:translateX(-50%);' +
        'z-index:3003;color:#556677;font-size:11px;text-align:center;' +
        'background:rgba(0,10,30,0.6);padding:4px 14px;border-radius:8px;' +
        'pointer-events:none;transition:opacity 0.5s;';
    tip.textContent = '🖱️ 缩小至全市/省范围自动返回太空 · 滚轮缩放 · 拖拽移动';
    mapDom.appendChild(tip);
    setTimeout(function() { tip.style.opacity = '0.4'; }, 3000);
}

// ===== 将相机定位到地球近轨 =====
function positionCameraNearEarth(earthEntry, dist) {
    // 确保退出后的距离不会立即触发自动进入（使用稍大一点的距离）
    if (dist < MAP_AUTO_ENTER_DIST + 0.5) {
        dist = MAP_AUTO_ENTER_DIST + 0.5;
    }
    var target = earthEntry.mesh.position.clone();
    // 保持相机当前的方向角度（相对于太阳），但调整距离
    var camPos = SPACEDEMO.camera.position.clone();
    var dir = camPos.sub(SPACEDEMO.controls.target).normalize();
    // 使用传入的距离
    var newPos = target.clone().add(dir.multiplyScalar(dist));

    SPACEDEMO.camera.position.copy(newPos);
    SPACEDEMO.controls.target.copy(target);
    SPACEDEMO.controls.update();

    SPACEDEMO.focusedPlanet = earthEntry;

    // 同步缩放滑块
    SPACEDEMO.targetZoomDist = dist;
    var slider = document.getElementById('zoomSlider');
    if (slider) slider.value = zoomToSlider(dist);
    var zv = document.getElementById('zoomValue');
    if (zv) zv.textContent = Math.round((1 - (dist - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)) * 100) + '%';
}

// ===== 退出地图模式 =====
function exitMapMode() {
    if (!SPACEDEMO.mapModeActive) return;
    lastMapExitTime = Date.now();
    SPACEDEMO.mapModeActive = false;
    if (mapDom) {
        mapDom.remove();
        mapDom = null;
    }
    mapInstance = null;

    // 恢复 3D UI 元素
    document.querySelectorAll('#labelToggle, #fullscreenBtn, #enterMapBtn, #timePanel, #tipBar')
        .forEach(function(el) {
            if (el) el.style.display = '';
        });
    var zoomSlider = document.getElementById('zoomSlider');
    var zoomValue = document.getElementById('zoomValue');
    if (zoomSlider) zoomSlider.style.display = '';
    if (zoomValue) zoomValue.style.display = '';
    if (SPACEDEMO.labelsVisible) {
        SPACEDEMO.labelObjects.forEach(function(lo) {
            lo.div.style.display = '';
        });
    }

    updateEnterMapButton();
}

// ===== 🗺️ 按钮设置 =====
function setupMapModeButton() {
    var btn = document.createElement('button');
    btn.id = 'enterMapBtn';
    btn.innerHTML = '🗺️';
    btn.title = '进入地图模式（拉近地球或点击此按钮）';
    btn.style.cssText = 'position:fixed;top:70px;right:20px;z-index:1500;' +
        'background:rgba(0,20,40,0.7);border:1px solid rgba(0,200,255,0.3);color:#445566;' +
        'padding:8px 12px;border-radius:8px;cursor:pointer;font-size:18px;' +
        'backdrop-filter:blur(6px);opacity:0.4;pointer-events:none;transition:all 0.3s;';
    btn.onclick = function() {
        if (SPACEDEMO.mapModeActive) {
            exitMapMode();
            var earthEntry = findEarth();
            if (earthEntry) positionCameraNearEarth(earthEntry, 4);
        } else if (canEnterMapMode()) {
            openMapMode();
        } else {
            // 不在可进入状态时，尝试聚焦地球
            SPACEDEMO.planets.forEach(function(p) {
                if (p.data.name === '地球') {
                    focusOnPlanet(p);
                }
            });
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
    btn.style.opacity = can ? '1' : '0.3';
    btn.style.pointerEvents = can ? 'auto' : 'auto'; // 可点，自动聚焦地球
    btn.style.color = can ? '#00ddff' : '#445566';
    btn.style.borderColor = can ? 'rgba(0,200,255,0.5)' : 'rgba(0,200,255,0.3)';
    btn.title = can ? '点击进入地图模式' : '点击聚焦地球';
}

// ===== 自动进入检测（从 app.js animate 调用）=====
function checkAutoEnterMap() {
    if (SPACEDEMO.mapModeActive) return;
    if (SPACEDEMO.focusAnim) return; // 动画中不要打断
    // 退出冷却期内不进入
    if (Date.now() - lastMapExitTime < MAP_EXIT_COOLDOWN) return;
    if (!SPACEDEMO.focusedPlanet || SPACEDEMO.focusedPlanet.data.name !== '地球') return;

    var dist = SPACEDEMO.camera.position.distanceTo(SPACEDEMO.controls.target);
    if (dist < MAP_AUTO_ENTER_DIST) {
        openMapMode();
    }
}
