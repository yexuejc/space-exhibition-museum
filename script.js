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

// ===== 噪声函数（简易 Perlin）=====
var SimplexNoise = (function() {
    var grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
                 [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
                 [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    var p = [];
    for (var i = 0; i < 256; i++) p[i] = i;
    for (var i = 255; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = p[i]; p[i] = p[j]; p[j] = t;
    }
    var perm = new Array(512);
    for (var i = 0; i < 512; i++) perm[i] = p[i & 255];
    function dot3(g, x, y, z) { return g[0]*x + g[1]*y + g[2]*z; }
    return {
        noise3D: function(xin, yin, zin) {
            var F2 = 0.5*(Math.sqrt(3)-1), G2 = (3-Math.sqrt(3))/6;
            var s = (xin+yin+zin)*F2;
            var i = Math.floor(xin+s), j = Math.floor(yin+s), k = Math.floor(zin+s);
            var t = (i+j+k)*G2;
            var X0 = i-t, Y0 = j-t, Z0 = k-t;
            var x0 = xin-X0, y0 = yin-Y0, z0 = zin-Z0;
            var i1,j1,k1,i2,j2,k2;
            if(x0>=y0) { if(y0>=z0) { i1=1;j1=0;k1=0;i2=1;j2=1;k2=0; }
                         else if(x0>=z0) { i1=1;j1=0;k1=0;i2=1;j2=0;k2=1; }
                         else { i1=0;j1=0;k1=1;i2=1;j2=0;k2=1; } }
            else { if(y0<z0) { i1=0;j1=0;k1=1;i2=0;j2=1;k2=1; }
                   else if(x0<z0) { i1=0;j1=1;k1=0;i2=0;j2=1;k2=1; }
                   else { i1=0;j1=1;k1=0;i2=1;j2=1;k2=0; } }
            var x1 = x0-i1+G2, y1 = y0-j1+G2, z1 = z0-k1+G2;
            var x2 = x0-i2+2*G2, y2 = y0-j2+2*G2, z2 = z0-k2+2*G2;
            var x3 = x0-1+3*G2, y3 = y0-1+3*G2, z3 = z0-1+3*G2;
            var ii = i&255, jj = j&255, kk = k&255;
            var gi0 = perm[ii+perm[jj+perm[kk]]] % 12;
            var gi1 = perm[ii+i1+perm[jj+j1+perm[kk+k1]]] % 12;
            var gi2 = perm[ii+i2+perm[jj+j2+perm[kk+k2]]] % 12;
            var gi3 = perm[ii+1+perm[jj+1+perm[kk+1]]] % 12;
            var n0 = 0, n1 = 0, n2 = 0, n3 = 0;
            var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
            if(t0>0) { t0*=t0; n0 = t0*t0*dot3(grad3[gi0],x0,y0,z0); }
            var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
            if(t1>0) { t1*=t1; n1 = t1*t1*dot3(grad3[gi1],x1,y1,z1); }
            var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
            if(t2>0) { t2*=t2; n2 = t2*t2*dot3(grad3[gi2],x2,y2,z2); }
            var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
            if(t3>0) { t3*=t3; n3 = t3*t3*dot3(grad3[gi3],x3,y3,z3); }
            return 32*(n0+n1+n2+n3);
        },
        noise2D: function(x, y) { return this.noise3D(x, y, 0); },
        fbm: function(x, y, octaves) {
            var val = 0, amp = 1, freq = 1, maxVal = 0;
            for (var i = 0; i < octaves; i++) {
                val += amp * this.noise2D(x * freq, y * freq);
                maxVal += amp;
                amp *= 0.5;
                freq *= 2;
            }
            return val / maxVal;
        }
    };
})();

// ===== 增强程序化纹理 =====
// 为无真实纹理的行星生成高拟真度贴图
function createBandTexture(width, height, colors, turbulence) {
    var canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    var ctx = canvas.getContext('2d');
    for (var y = 0; y < height; y++) {
        var progress = y / height;
        // 找颜色区间
        var ci = 0;
        for (var j = 0; j < colors.length - 1; j++) {
            if (progress >= colors[j][0] && progress <= colors[j+1][0]) {
                ci = j; break;
            }
        }
        var local = (progress - colors[ci][0]) / (colors[ci+1][0] - colors[ci][0] + 0.001);
        var r = colors[ci][1] + (colors[ci+1][1] - colors[ci][1]) * local;
        var g = colors[ci][2] + (colors[ci+1][2] - colors[ci][2]) * local;
        var b = colors[ci][3] + (colors[ci+1][3] - colors[ci][3]) * local;
        // 湍流扰动
        var turb = 0;
        if (turbulence) {
            var nx = y / height * turbulence.scale;
            turb = SimplexNoise.noise2D(nx, 0) * turbulence.amount;
            r += turb; g += turb; b += turb;
        }
        ctx.fillStyle = 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
        ctx.fillRect(0, y, width, 1);
    }
    // 斑点和细节
    if (turbulence && turbulence.spots) {
        for (var i = 0; i < turbulence.spots; i++) {
            var sx = Math.random() * width, sy = Math.random() * height;
            var sr = Math.random() * 15 + 3;
            var alpha = Math.random() * 0.2 + 0.05;
            var shade = Math.random() > 0.5 ? 30 : -30;
            ctx.fillStyle = 'rgba(' + (128+shade) + ',' + (128+shade) + ',' + (128+shade) + ',' + alpha + ')';
            ctx.beginPath(); ctx.ellipse(sx, sy, sr, sr*0.5, Math.random()*Math.PI, 0, Math.PI*2); ctx.fill();
        }
    }
    // 大红斑（木星）
    if (turbulence && turbulence.greatRedSpot) {
        var cx = width * 0.35, cy = height * 0.55;
        for (var dy = -30; dy <= 30; dy++) {
            for (var dx = -40; dx <= 40; dx++) {
                var dist = Math.sqrt(dx*dx + dy*dy*1.5);
                if (dist < 35) {
                    var alpha = (1 - dist/35) * 0.8;
                    var px = Math.round(cx + dx), py = Math.round(cy + dy);
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        ctx.fillStyle = 'rgba(200, 80, 50, ' + alpha + ')';
                        ctx.fillRect(px, py, 1, 1);
                    }
                }
            }
        }
    }
    return new THREE.CanvasTexture(canvas);
}

function createCraterTexture(width, height, baseColor, craterCount) {
    var canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    var ctx = canvas.getContext('2d');
    var r = (baseColor >> 16) & 0xff, g = (baseColor >> 8) & 0xff, b = baseColor & 0xff;
    // 基础渐变
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var noise = SimplexNoise.noise2D(x/80, y/80) * 25;
            var n2 = SimplexNoise.noise2D(x/30, y/30) * 12;
            var cr = Math.min(255, Math.max(0, r + noise + n2));
            var cg = Math.min(255, Math.max(0, g + noise + n2));
            var cb = Math.min(255, Math.max(0, b + noise + n2));
            ctx.fillStyle = 'rgb(' + Math.round(cr) + ',' + Math.round(cg) + ',' + Math.round(cb) + ')';
            ctx.fillRect(x, y, 1, 1);
        }
    }
    // 陨石坑
    for (var i = 0; i < craterCount; i++) {
        var cx = Math.random() * width, cy = Math.random() * height;
        var rad = Math.random() * 12 + 3;
        // 坑边缘亮色
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI*2); ctx.stroke();
        // 坑内部暗色
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath(); ctx.arc(cx, cy, rad*0.7, 0, Math.PI*2); ctx.fill();
        // 坑中心高光
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath(); ctx.arc(cx-rad*0.2, cy-rad*0.2, rad*0.3, 0, Math.PI*2); ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
}

function createSwirlTexture(width, height, colors) {
    var canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    var ctx = canvas.getContext('2d');
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var nx = x / width * 4, ny = y / height * 4;
            var swirl = SimplexNoise.noise2D(nx, ny) * 0.3 +
                        SimplexNoise.noise2D(nx*2+1.7, ny*2+3.2) * 0.15;
            var t = (y/height + swirl + 1) / 2;
            t = Math.max(0, Math.min(1, t));
            var ci = Math.floor(t * (colors.length - 1));
            ci = Math.min(ci, colors.length - 2);
            var local = (t - ci/(colors.length-1)) * (colors.length-1);
            var idx = 0;
            for (var j = 0; j < colors.length - 1; j++) {
                if (t >= j/(colors.length-1) && t <= (j+1)/(colors.length-1)) { idx = j; break; }
            }
            local = (t - idx/(colors.length-1)) * (colors.length-1);
            var c1 = colors[idx], c2 = colors[Math.min(idx+1, colors.length-1)];
            var cr = c1[0] + (c2[0]-c1[0])*local;
            var cg = c1[1] + (c2[1]-c1[1])*local;
            var cb = c1[2] + (c2[2]-c1[2])*local;
            ctx.fillStyle = 'rgb(' + Math.round(cr) + ',' + Math.round(cg) + ',' + Math.round(cb) + ')';
            ctx.fillRect(x, y, 1, 1);
        }
    }
    return new THREE.CanvasTexture(canvas);
}

// ===== 行星真实数据 =====
var SUN_RADIUS = 5;

var planetData = [
    { name:'水星', icon:'☿', realRatio:0.0035, dist:8,  color:0xaaaaaa,
      orbitalPeriod:0.2408, rotationPeriod:58.646,
      L0:252.25084,
      texType:'crater',
      info:{ ch:'距太阳最近，表面温差极大（-180°C~430°C）。',
             en:'Closest to the Sun, extreme temperature swings.' } },
    { name:'金星', icon:'♀', realRatio:0.0087, dist:12, color:0xffaa00,
      orbitalPeriod:0.6152, rotationPeriod:-243.025,
      L0:181.97973,
      texType:'swirl',
      info:{ ch:'最热行星，浓厚CO₂大气，表面温度465°C。',
             en:'Hottest planet, thick CO₂ atmosphere, 465°C surface.' } },
    { name:'地球', icon:'🌍', realRatio:0.0092, dist:16, color:0x4488ff,
      orbitalPeriod:1.0, rotationPeriod:0.9973,
      L0:100.46435,
      texType:'earth_real',
      info:{ ch:'我们的家园，唯一已知拥有液态水和生命的星球。',
             en:'Our home, the only known planet with liquid water and life.' } },
    { name:'火星', icon:'♂',  realRatio:0.0049, dist:20, color:0xcc4400,
      orbitalPeriod:1.8808, rotationPeriod:1.02596,
      L0:355.45332,
      texType:'banded',
      info:{ ch:'红色星球，拥有太阳系最高峰奥林匹斯山。',
             en:'Red Planet, home to the solar system\'s tallest mountain.' } },
    { name:'木星', icon:'♃', realRatio:0.1027, dist:28, color:0xd4a574,
      orbitalPeriod:11.862, rotationPeriod:0.41354,
      L0:34.33479,
      texType:'jupiter',
      info:{ ch:'最大行星，大红斑风暴已持续数百年。',
             en:'Largest planet, Great Red Spot storm for centuries.' } },
    { name:'土星', icon:'♄', realRatio:0.0865, dist:36, color:0xeeddbb,
      orbitalPeriod:29.457, rotationPeriod:0.44403,
      L0:49.94424,
      texType:'saturn',
      hasRing:true,
      info:{ ch:'以壮观的环系统闻名，密度低于水，有82颗已知卫星。',
             en:'Spectacular ring system, less dense than water.' } },
    { name:'天王星', icon:'♅', realRatio:0.0367, dist:44, color:0x44aaff,
      orbitalPeriod:84.011, rotationPeriod:-0.71833,
      L0:313.23218,
      texType:'smooth',
      info:{ ch:'冰巨星，自转轴几乎与轨道平行，"躺着"转。',
             en:'Ice giant with extreme 98° axial tilt.' } },
    { name:'海王星', icon:'♆', realRatio:0.0356, dist:52, color:0x3344ee,
      orbitalPeriod:164.79, rotationPeriod:0.67125,
      L0:304.88003,
      texType:'banded',
      info:{ ch:'最远行星，风速可达2100km/h，太阳系风速最快。',
             en:'Fastest winds in solar system up to 2,100 km/h.' } }
];

planetData.forEach(function(p) {
    p.radius = SUN_RADIUS * Math.pow(p.realRatio, 0.37);
});

// ===== 生成行星纹理 =====
var textureCache = {};

function getPlanetTexture(p) {
    var w = 512, h = 256;
    if (p.texType === 'earth_real') {
        // 地球用真实 NASA 纹理
        var loader = new THREE.TextureLoader();
        var tex = loader.load(
            'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
            function(t) { t.needsUpdate = true; },
            undefined,
            function() { /* 加载失败用生成纹理 */ }
        );
        return tex;
    }
    if (p.texType === 'jupiter') {
        return createBandTexture(w, h, [
            [0, 180,160,140], [0.08, 220,200,170], [0.15, 180,160,135],
            [0.25, 200,180,150], [0.30, 240,220,190], [0.38, 180,160,135],
            [0.45, 210,190,160], [0.50, 240,225,200], [0.55, 210,190,160],
            [0.60, 180,160,135], [0.68, 200,180,150], [0.75, 220,200,170],
            [0.82, 180,160,140], [0.90, 200,180,155], [1.0, 170,150,130]
        ], { scale:8, amount:15, spots:60, greatRedSpot:true });
    }
    if (p.texType === 'saturn') {
        return createBandTexture(w, h, [
            [0, 220,210,190], [0.12, 240,230,210], [0.20, 210,195,175],
            [0.30, 230,220,200], [0.40, 245,235,220], [0.48, 220,210,190],
            [0.55, 235,225,205], [0.62, 210,200,180], [0.70, 225,215,195],
            [0.78, 240,230,215], [0.85, 215,205,185], [1.0, 225,215,195]
        ], { scale:6, amount:10, spots:30 });
    }
    if (p.texType === 'mars') {
        return createBandTexture(w, h, [
            [0, 200,100,50], [0.12, 180,85,40], [0.25, 210,110,55],
            [0.35, 160,75,35], [0.48, 190,95,45], [0.55, 170,80,38],
            [0.65, 200,105,50], [0.75, 180,90,42], [0.85, 160,75,35],
            [0.92, 200,100,48], [1.0, 180,85,40]
        ], { scale:12, amount:8, spots:40 });
    }
    if (p.texType === 'crater') {
        return createCraterTexture(w, h, p.color, 120);
    }
    if (p.texType === 'swirl') {
        return createSwirlTexture(w, h, [
            [200,160,80], [180,140,60], [210,170,90],
            [170,130,55], [190,150,70], [200,160,80]
        ]);
    }
    if (p.texType === 'smooth') {
        return createSwirlTexture(w, h, [
            [80,180,220], [70,165,205], [90,190,230],
            [65,160,200], [85,185,225], [75,170,210]
        ]);
    }
    // 默认：banded
    return createBandTexture(w, h, [
        [0, 200,180,160], [0.5, 220,200,180], [1.0, 200,180,160]
    ], { scale:5, amount:5 });
}

function createSunProcedural() {
    var canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    var ctx = canvas.getContext('2d');
    var grad = ctx.createRadialGradient(256, 128, 0, 256, 128, 256);
    grad.addColorStop(0, '#fffbe6'); grad.addColorStop(0.3, '#ffdd44');
    grad.addColorStop(0.6, '#ff8800'); grad.addColorStop(0.8, '#cc4400');
    grad.addColorStop(1, '#661100');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 256);
    for (var i = 0; i < 150; i++) {
        ctx.fillStyle = 'rgba(255,200,50,' + (Math.random()*0.2+0.05) + ')';
        ctx.beginPath(); ctx.arc(Math.random()*512, Math.random()*256, Math.random()*30+5, 0, Math.PI*2); ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
}

// ===== 时间模拟引擎 =====
var BASE_SPEED = 3600;
var simTime, speedMultiplier = 1, isPaused = false, lastRealTime;

function initTimeEngine() {
    simTime = new Date().getTime();
    lastRealTime = performance.now();
}

function updateTime() {
    if (isPaused) { lastRealTime = performance.now(); return; }
    var now = performance.now();
    var realDelta = (now - lastRealTime) / 1000;
    lastRealTime = now;
    simTime += realDelta * BASE_SPEED * speedMultiplier * 1000;
}

function getSimDate() { return new Date(simTime); }

function getPlanetAngle(p) {
    var j2000 = new Date('2000-01-01T12:00:00Z').getTime();
    var daysSinceJ2000 = (simTime - j2000) / 86400000;
    var orbitalDays = p.orbitalPeriod * 365.25;
    return ((p.L0 + (360/orbitalDays) * daysSinceJ2000) % 360) / 180 * Math.PI;
}

function getPlanetRotation(p) {
    var j2000 = new Date('2000-01-01T12:00:00Z').getTime();
    var daysSinceJ2000 = (simTime - j2000) / 86400000;
    var period = Math.abs(p.rotationPeriod);
    if (period < 0.001) return 0;
    var direction = p.rotationPeriod > 0 ? 1 : -1;
    return ((daysSinceJ2000 / period) % 1) * Math.PI * 2 * direction;
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
var focusedPlanet = null, focusAnim = null;

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function focusOnPlanet(p, mesh, camera, controls) {
    window.hidePlanetCard && window.hidePlanetCard();
    if (focusedPlanet === p) { resetFocus(camera, controls); return; }
    focusedPlanet = p;
    controls.autoRotate = false;
    var targetPos = mesh.position.clone();
    var dist = Math.max(10, p.dist * 1.8);
    var dir = camera.position.clone().sub(controls.target).normalize();
    var camPos = targetPos.clone().add(dir.multiplyScalar(dist));
    focusAnim = { startTarget: controls.target.clone(), endTarget: targetPos, startCam: camera.position.clone(), endCam: camPos, progress: 0 };
}

function resetFocus(camera, controls) {
    focusedPlanet = null;
    controls.autoRotate = true;
    focusAnim = { startTarget: controls.target.clone(), endTarget: new THREE.Vector3(0,0,0), startCam: camera.position.clone(), endCam: new THREE.Vector3(0,30,60), progress: 0 };
}

function createFocusRing(scene) {
    var ring = new THREE.Mesh(
        new THREE.RingGeometry(0.4, 0.6, 32),
        new THREE.MeshBasicMaterial({ color:0x00ffff, side:THREE.DoubleSide, transparent:true, opacity:0.8, depthTest:false })
    );
    ring.visible = false; ring.position.set(0, 0.5, 0);
    scene.add(ring);
    return ring;
}

// ===== 3D 场景 =====
function initVR() {
    if (typeof THREE === 'undefined') {
        document.getElementById('vrContainer').innerHTML = '<p style="color:red;padding:3rem;">Three.js 加载失败，请检查网络连接</p>';
        return;
    }

    var container = document.getElementById('vrContainer');
    if (!container) return;

    var scene = new THREE.Scene();
    var w = container.clientWidth || 800, h = container.clientHeight || 600;
    var camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);
    camera.position.set(0, 30, 60);

    var renderer = new THREE.WebGLRenderer({ antialias:true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // CSS2D 标注渲染器
    var labelRenderer;
    if (typeof THREE.CSS2DRenderer !== 'undefined') {
        labelRenderer = new THREE.CSS2DRenderer();
        labelRenderer.setSize(w, h);
        labelRenderer.domElement.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:5;';
        labelRenderer.domElement.classList.add('label-overlay');
        container.appendChild(labelRenderer.domElement);
    } else {
        labelRenderer = { render: function() {}, setSize: function() {} };
    }

    // 标签开关
    var labelsVisible = true;
    var labelToggleBtn = document.getElementById('labelToggleBtn');
    if (labelToggleBtn) {
        labelToggleBtn.classList.add('active');
        labelToggleBtn.addEventListener('click', function() {
            labelsVisible = !labelsVisible;
            labelToggleBtn.classList.toggle('active');
            labelToggleBtn.title = labelsVisible ? '隐藏行星名称' : '显示行星名称';
        });
    }

    // 全屏切换
    var fullscreenBtn = document.getElementById('fullscreenBtn');
    var isFullscreen = false, scrollY = 0, bgCanvas = document.getElementById('bgStarCanvas');

    function toggleFullscreen() {
        isFullscreen = !isFullscreen;
        if (isFullscreen) {
            scrollY = window.scrollY;
            container.classList.add('is-fullscreen');
            document.body.classList.add('has-fullscreen');
            fullscreenBtn.textContent = '✕'; fullscreenBtn.title = '退出全屏';
            if (bgCanvas) bgCanvas.style.display = 'none';
        } else {
            container.classList.remove('is-fullscreen');
            document.body.classList.remove('has-fullscreen');
            fullscreenBtn.textContent = '⛶'; fullscreenBtn.title = '全屏沉浸';
            if (bgCanvas) bgCanvas.style.display = '';
        }
        setTimeout(function() {
            var cw = container.clientWidth, ch = container.clientHeight;
            if (cw > 0 && ch > 0) {
                camera.aspect = cw/ch; camera.updateProjectionMatrix();
                renderer.setSize(cw, ch);
                if (labelRenderer) labelRenderer.setSize(cw, ch);
            }
        }, 50);
    }
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

    // 光照
    scene.add(new THREE.AmbientLight(0x404060, 0.4));
    var sunLight = new THREE.PointLight(0xffffff, 2, 500);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // 星空背景
    var starGeo = new THREE.BufferGeometry();
    var starCount = 3000, pos = new Float32Array(starCount*3);
    for (var i = 0; i < starCount; i++) {
        var r = 150 + Math.random() * 200, theta = Math.random() * Math.PI * 2, phi = Math.acos(2*Math.random()-1);
        pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i*3+1] = r * Math.cos(phi);
        pos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size:1.2, color:0xffffff, transparent:true, opacity:0.8, blending:THREE.AdditiveBlending, sizeAttenuation:true })));

    // 太阳
    var sun = new THREE.Mesh(
        new THREE.SphereGeometry(SUN_RADIUS, 64, 64),
        new THREE.MeshBasicMaterial({ map: createSunProcedural() })
    );
    scene.add(sun);
    var glow = new THREE.Mesh(
        new THREE.SphereGeometry(SUN_RADIUS * 1.16, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.12, side: THREE.BackSide })
    );
    scene.add(glow);

    // 创建行星
    var planets = [];
    var labelObjects = [];

    planetData.forEach(function(p) {
        var tex = getPlanetTexture(p);
        var mesh = new THREE.Mesh(
            new THREE.SphereGeometry(p.radius, 48, 48),
            new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.05 })
        );
        var angle = getPlanetAngle(p);
        mesh.position.set(Math.cos(angle) * p.dist, 0, Math.sin(angle) * p.dist);
        mesh.rotation.y = getPlanetRotation(p);
        scene.add(mesh);

        // 土星环
        var ringMesh = null;
        if (p.hasRing) {
            var ringGeo = new THREE.RingGeometry(p.radius * 1.3, p.radius * 2.5, 64);
            var ringCanvas = document.createElement('canvas');
            ringCanvas.width = 512; ringCanvas.height = 64;
            var rctx = ringCanvas.getContext('2d');
            for (var ri = 0; ri < 512; ri++) {
                var t = ri / 512;
                var gray = 150 + Math.sin(t * 30) * 40 + Math.sin(t * 17) * 20 + Math.sin(t * 53) * 15;
                var alpha = 0.3 + Math.sin(t * 20) * 0.2 + Math.sin(t * 45) * 0.1;
                rctx.fillStyle = 'rgba(' + Math.round(gray) + ',' + Math.round(gray*0.85) + ',' + Math.round(gray*0.7) + ',' + Math.max(0,Math.min(1,alpha)) + ')';
                rctx.fillRect(ri, 0, 1, 64);
            }
            var ringTex = new THREE.CanvasTexture(ringCanvas);
            ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
                map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: 0.85, depthWrite: false
            }));
            ringMesh.rotation.x = Math.PI / 2.5;
            ringMesh.position.copy(mesh.position);
            // 环是行星的子级，但 RingGeometry 的平面需要特殊处理
            // 更简单：单独加到场景，每帧更新位置
            scene.add(ringMesh);
        }

        var planetEntry = { mesh: mesh, data: p, ringMesh: ringMesh };
        planets.push(planetEntry);

        // CSS2D 标签
        if (labelRenderer && typeof THREE.CSS2DObject !== 'undefined') {
            var div = document.createElement('div');
            div.className = 'planet-label';
            div.innerHTML = '<span class="label-icon">' + p.icon + '</span>' + p.name + '<span class="label-sub">' + p.orbitalPeriod.toFixed(1) + '年</span>';
            var label = new THREE.CSS2DObject(div);
            label.position.set(0, p.radius + 1.2, 0);
            mesh.add(label);
            labelObjects.push({ label: label, data: p, div: div });
        }
    });

    // 轨道环
    planetData.forEach(function(p) {
        var ring = new THREE.Mesh(
            new THREE.RingGeometry(p.dist - 0.04, p.dist + 0.04, 64),
            new THREE.MeshBasicMaterial({ color:0x00ffff, side:THREE.DoubleSide, transparent:true, opacity:0.1 })
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
                }).catch(function(err) { alert('VR 不可用: ' + err.message); });
            } else { alert('您的浏览器不支持 WebXR。请使用 Chrome/Edge。'); }
        };
        document.body.appendChild(vrBtn);
    } catch(e) {}

    // OrbitControls
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.minDistance = 0.05; controls.maxDistance = 200;
    controls.zoomSpeed = 1.2;
    controls.autoRotate = true; controls.autoRotateSpeed = 0.3;
    controls.target.set(0, 0, 0);

    // ===== 缩放滑块（左侧竖排）=====
    var ZOOM_MIN = 0.05; // 极限靠近，可穿越行星表面
    var ZOOM_MAX = 180;
    var zoomSliderEl = document.getElementById('zoomSlider');
    var zoomLabelEl = document.getElementById('zoomLabel');
    var targetZoomDist = null; // 目标相机距离
    var zoomFromSlider = false; // 防止循环更新

    function sliderToZoom(val) {
        var t = val / 1000;
        return ZOOM_MAX * Math.pow(ZOOM_MIN / ZOOM_MAX, t);
    }

    function zoomToSlider(dist) {
        var clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, dist));
        var t = (Math.log(clamped) - Math.log(ZOOM_MAX)) / (Math.log(ZOOM_MIN) - Math.log(ZOOM_MAX));
        return Math.round(t * 1000);
    }

    if (zoomSliderEl) {
        zoomSliderEl.addEventListener('input', function() {
            var dist = sliderToZoom(parseFloat(this.value));
            targetZoomDist = dist;
            zoomFromSlider = true;
            zoomLabelEl.textContent = Math.round((1 - parseFloat(this.value)/1000) * 100) + '%';
        });
    }

    // 射线检测
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var clickables = planets.map(function(p) { return p.mesh; });

    // 双击/单击检测
    var clickTimer = null, isDoubleClick = false;

    renderer.domElement.addEventListener('click', function(event) {
        var rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var hits = raycaster.intersectObjects(clickables);
        var hitPlanet = hits.length > 0 ? planets.find(function(p) { return p.mesh === hits[0].object; }) : null;

        if (clickTimer) {
            clearTimeout(clickTimer); clickTimer = null;
            isDoubleClick = true;
            if (hitPlanet) focusOnPlanet(hitPlanet.data, hitPlanet.mesh, camera, controls);
            else resetFocus(camera, controls);
        } else {
            isDoubleClick = false;
            clickTimer = setTimeout(function() {
                clickTimer = null;
                if (!isDoubleClick) {
                    if (hitPlanet) window.showPlanetCard && window.showPlanetCard(hitPlanet.data);
                    else window.hidePlanetCard && window.hidePlanetCard();
                }
                isDoubleClick = false;
            }, 280);
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && focusedPlanet) resetFocus(camera, controls);
        if (e.key === 'Escape') window.hidePlanetCard && window.hidePlanetCard();
    });

    // 时间 UI 控制
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

    // ===== 地图模式 =====
    var mapOverlay = document.getElementById('mapOverlay');
    var mapContainer = document.getElementById('mapContainer');
    var enterMapBtn = document.getElementById('enterMapBtn');
    var exitMapBtn = document.getElementById('exitMapBtn');
    var mapSetupPrompt = document.getElementById('mapSetupPrompt');
    var amapKeyInput = document.getElementById('amapKeyInput');
    var amapKeySubmit = document.getElementById('amapKeySubmit');
    var amapInstance = null;
    var amapKey = localStorage.getItem('amap_key') || '';

    function canEnterMapMode() {
        // 聚焦在地球上且非常靠近
        if (!focusedPlanet || focusedPlanet.name !== '地球') return false;
        var dist = camera.position.distanceTo(controls.target);
        return dist < 2.5;
    }

    function updateEnterMapButton() {
        if (!enterMapBtn) return;
        if (canEnterMapMode()) {
            enterMapBtn.classList.add('ready');
            enterMapBtn.title = '进入地球地图模式';
        } else {
            enterMapBtn.classList.remove('ready');
            enterMapBtn.title = '🎯 聚焦地球并拉近视角以启用';
        }
    }

    function openMapMode() {
        if (!mapOverlay) return;
        mapOverlay.classList.add('active');
        if (amapKey) {
            mapSetupPrompt.style.display = 'none';
            loadAmap(amapKey);
        } else {
            mapSetupPrompt.style.display = 'flex';
        }
    }

    function loadAmap(key) {
        if (amapInstance) { amapInstance.destroy(); amapInstance = null; }
        mapContainer.innerHTML = '';
        // 检查 AMap 是否已加载
        if (typeof AMap !== 'undefined') {
            initAmapMap(key);
            return;
        }
        // 动态加载 AMap JS API
        var script = document.createElement('script');
        script.src = 'https://webapi.amap.com/maps?v=2.0&key=' + key;
        script.async = true;
        script.onload = function() {
            initAmapMap(key);
        };
        script.onerror = function() {
            mapContainer.innerHTML = '<div style="padding:3rem;text-align:center;color:#ff6464;">高德地图加载失败，请检查网络或 API Key 是否正确。</div>';
        };
        document.head.appendChild(script);
    }

    function initAmapMap(key) {
        try {
            amapInstance = new AMap.Map('mapContainer', {
                viewMode: '3D',
                zoom: 14,
                center: [116.397428, 39.90923], // 天安门
                mapStyle: 'amap://styles/light',
                features: ['bg', 'road', 'building', 'point']
            });
            amapInstance.addControl(new AMap.ToolBar());
            amapInstance.addControl(new AMap.Scale());
        } catch(e) {
            mapContainer.innerHTML = '<div style="padding:3rem;text-align:center;color:#ff6464;">地图初始化失败: ' + e.message + '</div>';
        }
    }

    if (enterMapBtn) {
        enterMapBtn.addEventListener('click', openMapMode);
    }
    if (exitMapBtn) {
        exitMapBtn.addEventListener('click', function() {
            mapOverlay.classList.remove('active');
        });
    }
    if (amapKeySubmit) {
        if (amapKeyInput && amapKey) amapKeyInput.value = amapKey;
        amapKeySubmit.addEventListener('click', function() {
            var key = amapKeyInput.value.trim();
            if (key) {
                amapKey = key;
                localStorage.setItem('amap_key', key);
                mapSetupPrompt.style.display = 'none';
                loadAmap(key);
            } else {
                alert('请输入有效的高德地图 API Key');
            }
        });
        amapKeyInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') amapKeySubmit.click();
        });
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mapOverlay && mapOverlay.classList.contains('active')) {
            mapOverlay.classList.remove('active');
        }
    });

    // ===== 主循环 =====
    function animate() {
        requestAnimationFrame(animate);
        updateTime();

        // 更新行星位置
        planets.forEach(function(p) {
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

        // 太阳自转
        sun.rotation.y += 0.0008;
        glow.rotation.y += 0.0004;

        // 聚焦动画
        if (focusAnim) {
            focusAnim.progress += 0.025;
            if (focusAnim.progress >= 1) { focusAnim.progress = 1; focusAnim = null; }
            var t = easeOutCubic(focusAnim.progress);
            controls.target.lerpVectors(focusAnim.startTarget, focusAnim.endTarget, t);
            camera.position.lerpVectors(focusAnim.startCam, focusAnim.endCam, t);
        }

        // ===== 缩放滑块控制 =====
        var currentDist = camera.position.distanceTo(controls.target);
        if (targetZoomDist !== null) {
            // 平滑逼近目标距离
            var newDist = currentDist + (targetZoomDist - currentDist) * 0.12;
            if (Math.abs(newDist - targetZoomDist) < 0.01) newDist = targetZoomDist;
            // 调整相机位置到目标距离
            var dir = camera.position.clone().sub(controls.target).normalize();
            camera.position.copy(controls.target).add(dir.multiplyScalar(newDist));
            if (Math.abs(newDist - targetZoomDist) < 0.01) targetZoomDist = null;
        }
        // 滚轮缩放时更新滑块
        if (zoomSliderEl && !zoomFromSlider) {
            var sv = zoomToSlider(currentDist);
            zoomSliderEl.value = sv;
            if (zoomLabelEl) zoomLabelEl.textContent = Math.round((1 - sv/1000) * 100) + '%';
        }
        zoomFromSlider = false;

        // 进入地图按钮状态
        updateEnterMapButton();

        // 聚焦追踪
        if (focusedPlanet && !focusAnim) {
            var fp = planets.find(function(p) { return p.data === focusedPlanet; });
            if (fp) {
                controls.target.copy(fp.mesh.position);
                focusRing.position.copy(fp.mesh.position);
                focusRing.position.y += fp.data.radius + 0.8;
                focusRing.visible = true;
                focusRing.rotation.x = -Math.PI / 2;
                focusRing.rotation.z += 0.02;
                // 标签高亮
                labelObjects.forEach(function(lo) {
                    if (lo.data === focusedPlanet) lo.div.classList.add('focused');
                    else lo.div.classList.remove('focused');
                });
            } else { focusRing.visible = false; }
        } else {
            focusRing.visible = false;
            labelObjects.forEach(function(lo) { lo.div.classList.remove('focused'); });
        }

        // 标签可见性（基于相机距离）
        if (labelObjects.length > 0 && labelRenderer) {
            labelObjects.forEach(function(lo) {
                var worldPos = new THREE.Vector3();
                lo.label.getWorldPosition(worldPos);
                var dist = camera.position.distanceTo(worldPos);
                var isClose = dist < 25;
                lo.div.style.opacity = (labelsVisible && isClose) ? '1' : '0';
                lo.div.style.transform = isClose ? 'scale(1)' : 'scale(0.8)';
            });
        }

        // 更新时间显示
        if (timeDisplay) {
            var d = getSimDate();
            timeDisplay.textContent = d.getFullYear() + '-' +
                String(d.getMonth()+1).padStart(2,'0') + '-' +
                String(d.getDate()).padStart(2,'0') + ' ' +
                String(d.getHours()).padStart(2,'0') + ':' +
                String(d.getMinutes()).padStart(2,'0') + ':' +
                String(d.getSeconds()).padStart(2,'0');
        }

        controls.update();
        renderer.render(scene, camera);
        if (labelRenderer) labelRenderer.render(scene, camera);
    }

    animate();

    // 自适应
    var ro = new ResizeObserver(function() {
        var cw = container.clientWidth, ch = container.clientHeight;
        if (cw > 0 && ch > 0) {
            camera.aspect = cw / ch; camera.updateProjectionMatrix();
            renderer.setSize(cw, ch);
            if (labelRenderer) labelRenderer.setSize(cw, ch);
        }
    });
    ro.observe(container);
}

// ===== 启动 =====
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initVR();
});