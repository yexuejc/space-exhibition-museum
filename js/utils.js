// ===== 太空探索博物馆 - 工具函数 =====
// 时间引擎、粒子背景、数学工具

// ===== 2D Canvas 粒子星空背景 =====
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

// ===== 时间模拟引擎 =====
var BASE_SPEED = 3600; // 1 现实秒 = 1 小时模拟时间
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

// 计算行星轨道角度（基于 J2000 历元真实轨道参数）
function getPlanetAngle(p) {
    var j2000 = new Date('2000-01-01T12:00:00Z').getTime();
    var daysSinceJ2000 = (simTime - j2000) / 86400000;
    var orbitalDays = p.orbitalPeriod * 365.25;
    return ((p.L0 + (360/orbitalDays) * daysSinceJ2000) % 360) / 180 * Math.PI;
}

// 计算行星自转角度
function getPlanetRotation(p) {
    var j2000 = new Date('2000-01-01T12:00:00Z').getTime();
    var daysSinceJ2000 = (simTime - j2000) / 86400000;
    var period = Math.abs(p.rotationPeriod);
    if (period < 0.001) return 0;
    var direction = p.rotationPeriod > 0 ? 1 : -1;
    return ((daysSinceJ2000 / period) % 1) * Math.PI * 2 * direction;
}

// ===== 缓动函数 =====
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ===== 缩放滑块数学 =====
function sliderToZoom(val) {
    var t = val / 1000;
    return ZOOM_MAX * Math.pow(ZOOM_MIN / ZOOM_MAX, t);
}

function zoomToSlider(dist) {
    var clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, dist));
    var t = Math.log(clamped / ZOOM_MAX) / Math.log(ZOOM_MIN / ZOOM_MAX);
    return Math.round(t * 1000);
}
