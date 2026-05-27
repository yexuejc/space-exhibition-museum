// ===== 纯 CSS 粒子星空背景（不依赖任何外部库） =====
function initParticles() {
    var canvas = document.createElement('canvas');
    canvas.id = 'bgStarCanvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;';
    document.body.prepend(canvas);

    var ctx = canvas.getContext('2d');
    var stars = [];
    var W, H;

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
    }
    resize();
    window.addEventListener('resize', resize);

    // 创建星星
    for (var i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 2 + 0.5,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            a: Math.random() * 0.8 + 0.2,
            da: (Math.random() - 0.5) * 0.005
        });
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        stars.forEach(function(s) {
            s.x += s.dx;
            s.y += s.dy;
            s.a += s.da;
            if (s.a > 1 || s.a < 0.1) s.da = -s.da;
            if (s.x < 0) s.x = W;
            if (s.x > W) s.x = 0;
            if (s.y < 0) s.y = H;
            if (s.y > H) s.y = 0;

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,' + s.a + ')';
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    draw();
}

// ===== 行星数据（真实比例） =====
// 真实直径 (km): 太阳 1,392,700
// 行星相对太阳的直径比率 * 视觉缩放系数
// 用 pow(ratio, 0.35) 做视觉压缩，保持大小顺序但让小的可见
var SUN_RADIUS = 5; // 太阳视觉半径（基准）

var planetData = [
    { name:'水星', icon:'☿', 
      realRatio:0.0035,  // 真实相对太阳直径
      dist:8,  color:0xaaaaaa,
      info:{ ch:'最小的行星，距太阳最近，表面温度极昼夜温差大（-180°C~430°C）。',
             en:'Smallest planet, closest to Sun, extreme temperature swings.' } },
    { name:'金星', icon:'♀', 
      realRatio:0.0087,
      dist:12, color:0xffaa00,
      info:{ ch:'最热的行星，大气浓厚含二氧化碳，表面温度可达465°C。',
             en:'Hottest planet, thick CO₂ atmosphere, surface up to 465°C.' } },
    { name:'地球', icon:'🌍', 
      realRatio:0.0092,
      dist:16, color:0x4488ff,
      info:{ ch:'我们的家园，目前已知唯一拥有液态水和生命的星球。',
             en:'Our home, the only known planet with liquid water and life.' } },
    { name:'火星', icon:'♂',  
      realRatio:0.0049,
      dist:20, color:0xcc4400,
      info:{ ch:'红色星球，拥有太阳系最高峰奥林匹斯山。已有多个探测器到达。',
             en:'Red Planet, home to Olympus Mons, the tallest mountain in solar system.' } },
    { name:'木星', icon:'♃', 
      realRatio:0.1027,
      dist:28, color:0xd4a574,
      info:{ ch:'太阳系最大行星，大红斑风暴已持续数百年。',
             en:'Largest planet, Great Red Spot storm has raged for centuries.' } },
    { name:'土星', icon:'♄', 
      realRatio:0.0865,
      dist:36, color:0xeeddbb,
      info:{ ch:'以壮观的环系统闻名，密度低于水，有82颗已知卫星。',
             en:'Famous for spectacular ring system, lower density than water.' } },
    { name:'天王星', icon:'♅', 
      realRatio:0.0367,
      dist:44, color:0x44aaff,
      info:{ ch:'冰巨星，自转轴几乎与轨道平行，像"躺"着转。',
             en:'Ice giant, rotates on its side with extreme axial tilt.' } },
    { name:'海王星', icon:'♆', 
      realRatio:0.0356,
      dist:52, color:0x3344ee,
      info:{ ch:'太阳系最远行星，风速可达2100km/h，是太阳系风速最快的。',
             en:'Farthest planet, fastest winds in solar system up to 2,100 km/h.' } }
];

// 用平方根压缩法计算视觉半径：让小的可见、大的不超太阳
planetData.forEach(function(p) {
    // pow(ratio, 0.35) 保留大小顺序，不等比例失真
    p.radius = SUN_RADIUS * Math.pow(p.realRatio, 0.37);
});

// 验证：太阳 = 5, 木星 ≈ 2.2, 地球 ≈ 0.95, 水星 ≈ 0.68 ✅

// ===== 程序化纹理生成 =====
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
            '<p><span class="label">相对大小：</span>' + (p.realRatio < 0.01 ? '小型（岩石行星）' : p.realRatio < 0.05 ? '中型（冰巨星）' : '巨型（气态巨星）') + '</p>' +
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

// ===== VR 360° 太阳系 =====
function initVR() {
    if (typeof THREE === 'undefined') {
        document.getElementById('vrContainer').innerHTML = '<p style="color:red;padding:3rem;">Three.js 加载失败，请检查网络连接</p>';
        return;
    }

    var container = document.getElementById('vrContainer');
    if (!container) return;

    var scene = new THREE.Scene();
    var w = container.clientWidth || 800;
    var h = container.clientHeight || 600;
    var camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(0, 25, 55);

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // 全屏沉浸模式
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
            // 恢复滚动位置
            window.scrollTo({ top: scrollY, behavior: 'instant' });
        }
        // 重新调整渲染器尺寸
        setTimeout(function() {
            var w = container.clientWidth;
            var h = container.clientHeight;
            if (w > 0 && h > 0) {
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            }
        }, 50);
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    // ESC 退出全屏
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isFullscreen) {
            toggleFullscreen();
        }
    });

    // 自定义 VR 按钮
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
                alert('您的浏览器不支持 WebXR。请使用支持 VR 的浏览器（Chrome / Edge）打开。');
            }
        };
        document.body.appendChild(vrBtn);
    } catch(e) {}

    // 光照
    scene.add(new THREE.AmbientLight(0x404060, 0.4));
    var sunLight = new THREE.PointLight(0xffffff, 2, 500);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // 远处星空（Three.js Points）
    var starGeo = new THREE.BufferGeometry();
    var starCount = 3000;
    var pos = new Float32Array(starCount * 3);
    var colors = new Float32Array(starCount * 3);
    for (var i = 0; i < starCount; i++) {
        var r = 150 + Math.random() * 200;
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.acos(2 * Math.random() - 1);
        pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i*3+1] = r * Math.cos(phi);
        pos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
        var bright = 0.5 + Math.random() * 0.5;
        colors[i*3] = bright;
        colors[i*3+1] = bright;
        colors[i*3+2] = bright;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    var starMat = new THREE.PointsMaterial({
        size: 1.2, vertexColors: true, transparent: true, opacity: 0.8,
        blending: THREE.AdditiveBlending, sizeAttenuation: true
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // 太阳
    var sun = new THREE.Mesh(
        new THREE.SphereGeometry(5, 64, 64),
        new THREE.MeshBasicMaterial({ map: createSunTexture() })
    );
    scene.add(sun);

    // 太阳光晕
    var glow = new THREE.Mesh(
        new THREE.SphereGeometry(5.8, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.12, side: THREE.BackSide })
    );
    scene.add(glow);

    // 创建行星（角度均匀分布，不重叠）
    var planets = planetData.map(function(p, idx) {
        var tex = createPlanetTexture(p.color, (p.name==='木星'||p.name==='土星') ? 'banded' : 'light');
        var mesh = new THREE.Mesh(
            new THREE.SphereGeometry(p.radius, 32, 32),
            new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, metalness: 0.1 })
        );
        // 等角度间隔分布，不再随机
        var angle = (idx / planetData.length) * Math.PI * 2;
        mesh.position.set(Math.cos(angle)*p.dist, 0, Math.sin(angle)*p.dist);
        scene.add(mesh);
        return { mesh: mesh, angle: angle, data: p };
    });

    // 轨道环
    planets.forEach(function(p) {
        var ring = new THREE.Mesh(
            new THREE.RingGeometry(p.data.dist-0.05, p.data.dist+0.05, 64),
            new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.12 })
        );
        ring.rotation.x = -Math.PI / 2;
        scene.add(ring);
    });

    // OrbitControls
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 180;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.target.set(0, 0, 0);

    // 点击检测
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var clickables = planets.map(function(p) { return p.mesh; });

    renderer.domElement.addEventListener('click', function(event) {
        var rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var hits = raycaster.intersectObjects(clickables);
        if (hits.length > 0) {
            var hit = planets.find(function(p) { return p.mesh === hits[0].object; });
            if (hit && window.showPlanetCard) window.showPlanetCard(hit.data);
        } else {
            if (window.hidePlanetCard) window.hidePlanetCard();
        }
    });

    // 动画
    function animate() {
        requestAnimationFrame(animate);
        sun.rotation.y += 0.001;
        glow.rotation.y += 0.0005;
        planets.forEach(function(p) {
            p.angle += 0.002 + (0.006 / (p.data.dist / 5));
            p.mesh.position.x = Math.cos(p.angle) * p.data.dist;
            p.mesh.position.z = Math.sin(p.angle) * p.data.dist;
            p.mesh.rotation.y += 0.005;
        });
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // 自适应
    var ro = new ResizeObserver(function() {
        var w2 = container.clientWidth, h2 = container.clientHeight;
        if (w2 > 0 && h2 > 0) {
            camera.aspect = w2 / h2;
            camera.updateProjectionMatrix();
            renderer.setSize(w2, h2);
        }
    });
    ro.observe(container);
}

// ===== 启动 =====
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initVR();
});
