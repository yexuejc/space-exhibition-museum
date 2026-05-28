// ===== 太空探索博物馆 - 工具函数 =====
// 时间引擎、粒子背景、数学工具

// ===== 2D Canvas 粒子星空背景（增强闪烁版）=====
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
    // 生成星星 - 大星(亮) + 小星(暗)混合
    for (var i = 0; i < 300; i++) {
        var isBig = Math.random() < 0.15;
        stars.push({
            x: Math.random() * W, y: Math.random() * H,
            r: isBig ? Math.random() * 1.5 + 1.2 : Math.random() * 1.0 + 0.3,
            dx: (Math.random() - 0.5) * 0.15, dy: (Math.random() - 0.5) * 0.15,
            a: isBig ? Math.random() * 0.6 + 0.4 : Math.random() * 0.4 + 0.15,
            baseA: 0, // 基准亮度
            phase: Math.random() * Math.PI * 2, // 闪烁相位
            speed: 0.8 + Math.random() * 2.0,   // 闪烁速度
            twinkleAmp: isBig ? 0.3 + Math.random() * 0.3 : 0.15 + Math.random() * 0.2, // 闪烁幅度
            isBig: isBig
        });
        stars[i].baseA = stars[i].a;
    }
    var startTime = performance.now();
    function draw() {
        var elapsed = (performance.now() - startTime) / 1000;
        ctx.clearRect(0, 0, W, H);
        stars.forEach(function(s) {
            s.x += s.dx; s.y += s.dy;
            // 闪烁
            var twinkle = Math.sin(elapsed * s.speed + s.phase);
            s.a = Math.max(0.05, s.baseA + twinkle * s.twinkleAmp);
            // 边界循环
            if (s.x < -5) s.x = W + 5; if (s.x > W + 5) s.x = -5;
            if (s.y < -5) s.y = H + 5; if (s.y > H + 5) s.y = -5;
            // 大星带十字光芒
            if (s.isBig && s.r > 1.8) {
                var glowAlpha = s.a * 0.15;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(200,220,255,' + glowAlpha + ')';
                ctx.fill();
                // 十字光芒
                ctx.strokeStyle = 'rgba(255,255,255,' + (glowAlpha * 0.5) + ')';
                ctx.lineWidth = 0.5;
                for (var ri = 0; ri < 4; ri++) {
                    var angle = ri * Math.PI / 4 + elapsed * 0.05;
                    ctx.beginPath();
                    ctx.moveTo(s.x - Math.cos(angle) * s.r * 5, s.y - Math.sin(angle) * s.r * 5);
                    ctx.lineTo(s.x + Math.cos(angle) * s.r * 5, s.y + Math.sin(angle) * s.r * 5);
                    ctx.stroke();
                }
            }
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

// 设置模拟日期（时间戳或 Date 对象），用于日期跳转功能
function setSimulationDate(dateInput) {
    if (typeof dateInput === 'number') {
        simTime = dateInput;
    } else if (dateInput instanceof Date) {
        simTime = dateInput.getTime();
    } else if (typeof dateInput === 'string') {
        simTime = new Date(dateInput).getTime();
    }
    lastRealTime = performance.now();
}

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
