// ===== 粒子星空背景 =====
function initParticles() {
    var canvas = document.createElement('canvas');
    canvas.id = 'bgStarCanvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;';
    document.body.prepend(canvas);
    var ctx = canvas.getContext('2d');
    var stars = [], W, H;
    function resize() { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; }
    resize();
    window.addEventListener('resize', resize);
    for (var i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * W, y: Math.random() * H,
            r: Math.random() * 2 + 0.5,
            dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3,
            a: Math.random() * 0.8 + 0.2, da: (Math.random() - 0.5) * 0.005
        });
    }
    function draw() {
        ctx.clearRect(0, 0, W, H);
        stars.forEach(function(s) {
            s.x += s.dx; s.y += s.dy; s.a += s.da;
            if (s.a > 1 || s.a < 0.1) s.da = -s.da;
            if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
            if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,' + s.a + ')';
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    draw();
}

// ===== 行星真实数据 =====
var SUN_RADIUS = 5;

// 真实公转周期（地球年）、自转周期（地球日）、J2000 平均黄经（度）
var planetData = [
    { name:'水星', icon:'☿', realRatio:0.0035, dist:8,  color:0xaaaaaa,
      orbitalPeriod:0.2408, rotationPeriod:58.646,
      L0:252.25084,
      info:{ ch:'距太阳最近，表面温差极大（-180°C~430°C）。',
             en:'Closest to the Sun, extreme temperature swings.' } },
    { name:'金星', icon:'♀', realRatio:0.0087, dist:12, color:0xffaa00,
      orbitalPeriod:0.6152, rotationPeriod:-243.025,
      L0:181.97973,
      info:{ ch:'最热行星，浓厚CO₂大气，表面温度465°C。',
             en:'Hottest planet, thick CO₂ atmosphere, 465°C surface.' } },
    { name:'地球', icon:'🌍', realRatio:0.0092, dist:16, color:0x4488ff,
      orbitalPeriod:1.0, rotationPeriod:0.9973,
      L0:100.46435,
      info:{ ch:'我们的家园，唯一已知拥有液态水和生命的星球。',
             en:'Our home, the only known planet with liquid water and life.' } },
    { name:'火星', icon:'♂',  realRatio:0.0049, dist:20, color:0xcc4400,
      orbitalPeriod:1.8808, rotationPeriod:1.02596,
      L0:355.45332,
      info:{ ch:'红色星球，拥有太阳系最高峰奥林匹斯山。',
             en:'Red Planet, home to the solar system\'s tallest mountain.' } },
    { name:'木星', icon:'♃', realRatio:0.1027, dist:28, color:0xd4a574,
      orbitalPeriod:11.862, rotationPeriod:0.41354,
      L0:34.33479,
      info:{ ch:'最大行星，大红斑风暴已持续数百年。',
             en:'Largest planet, Great Red Spot storm for centuries.' } },
    { name:'土星', icon:'♄', realRatio:0.0865, dist:36, color:0xeeddbb,
      orbitalPeriod:29.457, rotationPeriod:0.44403,
      L0:49.94424,
      info:{ ch:'以壮观的环系统闻名，密度低于水，有82颗已知卫星。',
             en:'Spectacular ring system, less dense than water.' } },
    { name:'天王星', icon:'♅', realRatio:0.0367, dist:44, color:0x44aaff,
      orbitalPeriod:84.011, rotationPeriod:-0.71833,
      L0:313.23218,
      info:{ ch:'冰巨星，自转轴几乎与轨道平行，"躺着"转。',
             en:'Ice giant with extreme 98° axial tilt.' } },
    { name:'海王星', icon:'♆', realRatio:0.0356, dist:52, color:0x3344ee,
      orbitalPeriod:164.79, rotationPeriod:0.67125,
      L0:304.88003,
      info:{ ch:'最远行星，风速可达2100km/h，太阳系风速最快。',
             en:'Fastest winds in solar system up to 2,100 km/h.' } }
];

// 视觉半径（基于真实比例平方根压缩）
planetData.forEach(function(p) {
    p.radius = SUN_RADIUS * Math.pow(p.realRatio, 0.37);
});

// ===== 时间模拟引擎 =====
var BASE_SPEED = 3600; // 1 真实秒 = 1 模拟小时

var simTime;
var speedMultiplier = 1;
var isPaused = false;
var lastRealTime;

function initTimeEngine() {
    simTime = new Date().getTime();
    lastRealTime = performance.now();
}

function updateTime() {
    if (isPaused) {
        lastRealTime = performance.now();
        return;
    }
    var now = performance.now();
    var realDelta = (now - lastRealTime) / 1000;
    lastRealTime = now;
    var simDelta = realDelta * BASE_SPEED * speedMultiplier * 1000;
    simTime += simDelta;
}

function getSimDate() {
    return new Date(simTime);
}

// 计算行星公转角度（基于模拟时间）
function getPlanetAngle(p) {
    var j2000 = new Date('2000-01-01T12:00:00Z').getTime();
    var daysSinceJ2000 = (simTime - j2000) / 86400000;
    var orbitalDays = p.orbitalPeriod * 365.25;
    var meanMotion = 360 / orbitalDays;
    var L = p.L0 + meanMotion * daysSinceJ2000;
    return (L % 360) / 180 * Math.PI;
}

// 计算行星自转角度
function getPlanetRotation(p) {
    var j2000 = new Date('2000-01-01T12:00:00Z').getTime();
    var daysSinceJ2000 = (simTime - j2000) / 86400000;
    var period = Math.abs(p.rotationPeriod);
    if (period < 0.001) return 0;
    var direction = p.rotationPeriod > 0 ? 1 : -1;
    var rotations = daysSinceJ2000 / period;
    return (rotations % 1) * Math.PI * 2 * direction;
}

// ===== 纹理生成 =====
function createPlanetTexture(color, variant) {
    var canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 128;
    var ctx = canvas.getContext('2d');
    var r = (color >> 16) & 0xff, g = (color >> 8) & 0xff, b = color & 0xff;
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.fillRect(0, 0, 256, 128);
    for (var i = 0; i < 200; i++) {
        var x = Math.random() * 256, y = Math.random() * 128;
        var size = Math.random() * 20 + 3;
        var alpha = Math.random() * 0.3;
        var shade = variant === 'light' ? 40 : -40;
        ctx.fillStyle = 'rgba(' + (r+shade*Math.random()) + ',' + (g+shade*Math.random()) + ',' + (b+shade*Math.random()) + ',' + alpha + ')';
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }
    if (variant === 'banded') {
        for (var i = 0; i < 12; i++) {
            var y = Math.random() * 128, h = Math.random() * 8 + 2;
            ctx.fillStyle = 'rgba(255,255,255,' + (Math.random()*0.2+0.1) + ')';
            ctx.fillRect(0, y, 256, h);
        }
    }
    var tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

function createSunTexture() {
    var canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    var ctx = canvas.getContext('2d');
    var grad = ctx.createRadialGradient(256, 128, 0, 256, 128, 256);
    grad.addColorStop(0, '#fffbe6'); grad.addColorStop(0.3, '#ffdd44');
    grad.addColorStop(0.6, '#ff8800'); grad.addColorStop(0.8, '#cc4400');
    grad.addColorStop(1, '#661100');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 256);
    for (var i = 0; i < 100; i++) {
        ctx.fillStyle = 'rgba(255,200,50,' + (Math.random()*0.2+0.05) + ')';
        ctx.beginPath();
        ctx.arc(Math.random()*512, Math.random()*256, Math.random()*30+5, 0, Math.PI*2);
        ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
}

// ===== 行星信息卡片 =====
(function initCard() {
    var card = document.getElementById('planetCard');
    if (!card) return;
    var cardTitle = document.getElementById('cardTitle');
    var cardContent = document.getElementById('cardContent');
    var cardClose = document.getElementById('cardClose');
    var cardIcon = document.getElementById('cardIcon');
    window.showPlanetCard = function(p) {
        cardTitle.textContent = p.name;
        cardIcon.textContent = p.icon || '🪐';
        cardContent.innerHTML =
            '<p><span class="label">距太阳：</span>' + (p.dist * 5) + ' 百万公里</p>' +
            '<p><span class="label">公转周期：</span>' + p.orbitalPeriod.toFixed(2) + ' 地球年</p>' +
            '<p><span class="label">自转周期：</span>' + Math.abs(p.rotationPeriod).toFixed(1) + ' 地球日' + (p.rotationPeriod < 0 ? '（逆向）' : '') + '</p>' +
            '<p><span class="label">类型：</span>' + (p.realRatio < 0.01 ? '岩石行星' : p.realRatio < 0.05 ? '冰巨星' : '气态巨星') + '</p>' +
            '<p><span class="label">描述：</span>' + p.info.ch + '</p>' +
            '<p style="color:#888;font-size:0.85rem;margin-top:0.8rem;border-left:none;padding-left:0;"><em>' + p.info.en + '</em></p>';
        card.classList.add('show');
    };
    window.hidePlanetCard = function() { card.classList.remove('show'); };
    if (cardClose) cardClose.addEventListener('click', window.hidePlanetCard);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') window.hidePlanetCard && window.hidePlanetCard();
    });
})();

// ===== 相机聚焦动画 =====
// 双击行星 → 聚焦追踪；双击空白 → 归位看太阳
var focusedPlanet = null;  // 当前聚焦的行星对象（null=太阳）
var focusAnim = null;      // 动画状态

// 缓出三次函数
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// 聚焦到指定行星
function focusOnPlanet(p, mesh, camera, controls) {
    window.hidePlanetCard && window.hidePlanetCard();

    // 如果已经聚焦在这个行星上 → 再次双击就切回太阳
    if (focusedPlanet === p) {
        resetFocus(camera, controls);
        return;
    }

    focusedPlanet = p;
    controls.autoRotate = false; // 聚焦时关闭自动旋转

    var targetPos = mesh.position.clone();
    var dist = Math.max(10, p.dist * 1.8);
    // 保持相机的相对方向但靠近
    var dir = camera.position.clone().sub(controls.target).normalize();
    var camPos = targetPos.clone().add(dir.multiplyScalar(dist));

    focusAnim = {
        startTarget: controls.target.clone(),
        endTarget: targetPos,
        startCam: camera.position.clone(),
        endCam: camPos,
        progress: 0
    };
}

// 归位到太阳
function resetFocus(camera, controls) {
    focusedPlanet = null;
    controls.autoRotate = true; // 恢复自动旋转

    var targetPos = new THREE.Vector3(0, 0, 0);
    var camPos = new THREE.Vector3(0, 30, 60);

    focusAnim = {
        startTarget: controls.target.clone(),
        endTarget: targetPos,
        startCam: camera.position.clone(),
        endCam: camPos,
        progress: 0
    };
}

// ===== 焦点指示器（小光环显示当前聚焦目标）=====
function createFocusRing(scene) {
    var ring = new THREE.Mesh(
        new THREE.RingGeometry(0.4, 0.6, 32),
        new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
            depthTest: false
        })
    );
    ring.visible = false;
    ring.position.set(0, 0.5, 0); // 在行星上方
    scene.add(ring);
    return ring;
}

// ===== VR/3D 场景 =====
function initVR() {
    if (typeof THREE === 'undefined') {
        document.getElementById('vrContainer').innerHTML = '<p style="color:red;padding:3rem;">Three.js 加载失败，请检查网络连接</p>';
        return;
    }

    var container = document.getElementById('vrContainer');
    if (!container) return;

    // 场景
    var scene = new THREE.Scene();
    var w = container.clientWidth || 800;
    var h = container.clientHeight || 600;
    var camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(0, 30, 60);

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // 全屏切换
    var fullscreenBtn = document.getElementById('fullscreenBtn');
    var isFullscreen = false;
    var scrollY = 0;
    var bgCanvas = document.getElementById('bgStarCanvas');

    function toggleFullscreen() {
        isFullscreen = !isFullscreen;
        if (isFullscreen) {
            scrollY = window.scrollY;
            container.classList.add('is-fullscreen');
            document.body.classList.add('has-fullscreen');
            fullscreenBtn.textContent = '✕';
            fullscreenBtn.title = '退出全屏';
            if (bgCanvas) bgCanvas.style.display = 'none';
        } else {
            container.classList.remove('is-fullscreen');
            document.body.classList.remove('has-fullscreen');
            fullscreenBtn.textContent = '⛶';
            fullscreenBtn.title = '全屏沉浸';
            if (bgCanvas) bgCanvas.style.display = '';
        }
        setTimeout(function() {
            var cw = container.clientWidth, ch = container.clientHeight;
            if (cw > 0 && ch > 0) { camera.aspect = cw/ch; camera.updateProjectionMatrix(); renderer.setSize(cw, ch); }
        }, 50);
    }
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isFullscreen) toggleFullscreen();
    });

    // 光照
    scene.add(new THREE.AmbientLight(0x404060, 0.4));
    var sunLight = new THREE.PointLight(0xffffff, 2, 500);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // 星空背景
    var starGeo = new THREE.BufferGeometry();
    var starCount = 3000;
    var pos = new Float32Array(starCount * 3);
    for (var i = 0; i < starCount; i++) {
        var r = 150 + Math.random() * 200;
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.acos(2 * Math.random() - 1);
        pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i*3+1] = r * Math.cos(phi);
        pos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
        size: 1.2, color: 0xffffff, transparent: true, opacity: 0.8,
        blending: THREE.AdditiveBlending, sizeAttenuation: true
    })));

    // 太阳
    var sun = new THREE.Mesh(
        new THREE.SphereGeometry(SUN_RADIUS, 64, 64),
        new THREE.MeshBasicMaterial({ map: createSunTexture() })
    );
    scene.add(sun);
    var glow = new THREE.Mesh(
        new THREE.SphereGeometry(SUN_RADIUS * 1.16, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.12, side: THREE.BackSide })
    );
    scene.add(glow);

    // 创建行星
    var planets = planetData.map(function(p) {
        var tex = createPlanetTexture(p.color, (p.name==='木星'||p.name==='土星') ? 'banded' : 'light');
        var mesh = new THREE.Mesh(
            new THREE.SphereGeometry(p.radius, 32, 32),
            new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, metalness: 0.1 })
        );
        var angle = getPlanetAngle(p);
        mesh.position.set(Math.cos(angle) * p.dist, 0, Math.sin(angle) * p.dist);
        mesh.rotation.y = getPlanetRotation(p);
        scene.add(mesh);
        return { mesh: mesh, data: p };
    });

    // 轨道环
    planetData.forEach(function(p) {
        var ring = new THREE.Mesh(
            new THREE.RingGeometry(p.dist - 0.05, p.dist + 0.05, 64),
            new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.12 })
        );
        ring.rotation.x = -Math.PI / 2;
        scene.add(ring);
    });

    // 聚焦光环
    var focusRing = createFocusRing(scene);

    // VR 按钮
    try {
        var vrBtn = document.createElement('button');
        vrBtn.id = 'customVRButton';
        vrBtn.textContent = '🥽 进入 VR 模式';
        vrBtn.style.cssText = 'position:fixed;bottom:30px;right:30px;padding:15px 25px;background:linear-gradient(45deg,#ff0088,#8000ff);color:#fff;border:none;border-radius:50px;font-size:16px;font-weight:bold;cursor:pointer;z-index:10000;box-shadow:0 0 20px rgba(255,0,136,0.6);transition:all 0.3s;';
        vrBtn.onmouseover = function(){ this.style.transform = 'scale(1.05)'; };
        vrBtn.onmouseout = function(){ this.style.transform = 'scale(1)'; };
        vrBtn.onclick = function() {
            if (renderer.xr.isPresenting) {
                renderer.xr.endSession();
                vrBtn.textContent = '🥽 进入 VR 模式';
            } else if (navigator.xr) {
                navigator.xr.requestSession('immersive-vr').then(function(session) {
                    renderer.xr.setSession(session);
                    vrBtn.textContent = '🚪 退出 VR';
                }).catch(function(err) {
                    alert('VR 不可用: ' + err.message);
                });
            } else {
                alert('您的浏览器不支持 WebXR。请使用 Chrome/Edge。');
            }
        };
        document.body.appendChild(vrBtn);
    } catch(e) {}

    // OrbitControls
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 8;
    controls.maxDistance = 180;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.target.set(0, 0, 0);

    // 射线检测
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var clickables = planets.map(function(p) { return p.mesh; });

    // ===== 双击/单击检测 =====
    var clickTimer = null;
    var isDoubleClick = false;

    renderer.domElement.addEventListener('click', function(event) {
        // 计算点击射线
        var rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var hits = raycaster.intersectObjects(clickables);
        var hitObj = hits.length > 0 ? hits[0].object : null;
        var hitPlanet = hitObj ? planets.find(function(p) { return p.mesh === hitObj; }) : null;

        if (clickTimer) {
            // 第二次点击 → 双击
            clearTimeout(clickTimer);
            clickTimer = null;
            isDoubleClick = true;

            if (hitPlanet) {
                // 双击行星 → 聚焦追踪
                focusOnPlanet(hitPlanet.data, hitPlanet.mesh, camera, controls);
            } else {
                // 双击空白 → 归位看太阳
                resetFocus(camera, controls);
            }
        } else {
            isDoubleClick = false;
            clickTimer = setTimeout(function() {
                clickTimer = null;
                // 只有非双击时才执行单击逻辑
                if (!isDoubleClick) {
                    if (hitPlanet) {
                        window.showPlanetCard && window.showPlanetCard(hitPlanet.data);
                    } else {
                        window.hidePlanetCard && window.hidePlanetCard();
                    }
                }
                isDoubleClick = false;
            }, 280);
        }
    });

    // ESC 也重置聚焦
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && focusedPlanet) {
            resetFocus(camera, controls);
        }
    });

    // ===== 时间 UI 控制 =====
    initTimeEngine();

    var timeDisplay = document.getElementById('timeDisplay');
    var pauseBtn = document.getElementById('pauseBtn');
    var speedSlider = document.getElementById('timeSpeedSlider');
    var speedLabel = document.getElementById('speedLabel');

    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            isPaused = !isPaused;
            pauseBtn.textContent = isPaused ? '▶' : '⏸';
            pauseBtn.title = isPaused ? '继续' : '暂停';
            if (!isPaused) lastRealTime = performance.now();
        });
    }

    if (speedSlider) {
        speedSlider.addEventListener('input', function() {
            speedMultiplier = Math.pow(10, parseFloat(this.value));
            speedLabel.textContent = (speedMultiplier < 1 ? speedMultiplier.toFixed(1) : Math.round(speedMultiplier)) + '×';
        });
    }

    // ===== 主循环 =====
    function animate() {
        requestAnimationFrame(animate);

        // 更新时间
        updateTime();

        // 更新行星位置
        planets.forEach(function(p) {
            var angle = getPlanetAngle(p.data);
            p.mesh.position.x = Math.cos(angle) * p.data.dist;
            p.mesh.position.z = Math.sin(angle) * p.data.dist;
            p.mesh.rotation.y = getPlanetRotation(p.data);
        });

        // 太阳自转
        sun.rotation.y += 0.001;
        glow.rotation.y += 0.0005;

        // ===== 聚焦动画更新 =====
        if (focusAnim) {
            focusAnim.progress += 0.025;
            if (focusAnim.progress >= 1) {
                focusAnim.progress = 1;
                focusAnim = null;
            }
            var t = easeOutCubic(focusAnim.progress);
            controls.target.lerpVectors(focusAnim.startTarget, focusAnim.endTarget, t);
            camera.position.lerpVectors(focusAnim.startCam, focusAnim.endCam, t);
        }

        // ===== 聚焦追踪（跟随行星运动）=====
        if (focusedPlanet && !focusAnim) {
            // 找到聚焦的行星
            var fp = planets.find(function(p) { return p.data === focusedPlanet; });
            if (fp) {
                controls.target.copy(fp.mesh.position);
                // 聚焦光环跟随
                focusRing.position.copy(fp.mesh.position);
                focusRing.position.y += fp.data.radius + 0.8;
                focusRing.visible = true;
                // 光环旋转
                focusRing.rotation.x = -Math.PI / 2;
                focusRing.rotation.z += 0.02;
            } else {
                focusRing.visible = false;
            }
        } else {
            focusRing.visible = false;
        }

        // 更新时间显示
        if (timeDisplay) {
            var d = getSimDate();
            var y = d.getFullYear();
            var m = String(d.getMonth() + 1).padStart(2, '0');
            var day = String(d.getDate()).padStart(2, '0');
            var hh = String(d.getHours()).padStart(2, '0');
            var mm = String(d.getMinutes()).padStart(2, '0');
            var ss = String(d.getSeconds()).padStart(2, '0');
            timeDisplay.textContent = y + '-' + m + '-' + day + ' ' + hh + ':' + mm + ':' + ss;
        }

        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    // 自适应
    var ro = new ResizeObserver(function() {
        var cw = container.clientWidth, ch = container.clientHeight;
        if (cw > 0 && ch > 0) {
            camera.aspect = cw / ch;
            camera.updateProjectionMatrix();
            renderer.setSize(cw, ch);
        }
    });
    ro.observe(container);
}

// ===== 启动 =====
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initVR();
});
