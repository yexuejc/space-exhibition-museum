// ===== 太空探索博物馆 - 纹理生成 =====
// 程序化纹理（除地球使用 NASA CDN 真实纹理外，其余行星均用 Canvas 生成）

// 简易 3D Simplex Noise
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

// ===== 条带纹理（木星、土星等）=====
function createBandTexture(width, height, colors, turbulence) {
    var canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    var ctx = canvas.getContext('2d');
    for (var y = 0; y < height; y++) {
        var progress = y / height;
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
        var turb = 0;
        if (turbulence) {
            var nx = y / height * turbulence.scale;
            turb = SimplexNoise.noise2D(nx, 0) * turbulence.amount;
            r += turb; g += turb; b += turb;
        }
        ctx.fillStyle = 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
        ctx.fillRect(0, y, width, 1);
    }
    if (turbulence && turbulence.spots) {
        for (var i = 0; i < turbulence.spots; i++) {
            var sx = Math.random() * width, sy = Math.random() * height;
            var sr = Math.random() * 15 + 3;
            var alpha = Math.random() * 0.2 + 0.05;
            var shade = Math.random() * 30 - 15;
            ctx.fillStyle = 'rgba(' + (128+shade) + ',' + (96+shade) + ',' + (64+shade) + ',' + alpha.toFixed(2) + ')';
            ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI*2); ctx.fill();
        }
        // 大红斑（木星）
        if (turbulence.greatRedSpot) {
            var cx = width * 0.7, cy = height * 0.55;
            var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
            grad.addColorStop(0, 'rgba(200,80,40,0.6)'); grad.addColorStop(0.5, 'rgba(180,60,30,0.4)'); grad.addColorStop(1, 'rgba(200,80,40,0)');
            ctx.fillStyle = grad; ctx.fillRect(cx-50, cy-50, 100, 100);
        }
    }
    return new THREE.CanvasTexture(canvas);
}

// ===== 陨石坑纹理（水星、月球风格）=====
function createCraterTexture(width, height, baseColor, craterCount) {
    var canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    var ctx = canvas.getContext('2d');
    var r = (baseColor >> 16) & 0xff;
    var g = (baseColor >> 8) & 0xff;
    var b = baseColor & 0xff;
    // 基底噪声
    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            var n = SimplexNoise.fbm(i/80, j/80, 4) * 30;
            ctx.fillStyle = 'rgb(' + Math.round(r+n) + ',' + Math.round(g+n) + ',' + Math.round(b+n) + ')';
            ctx.fillRect(i, j, 1, 1);
        }
    }
    // 陨石坑
    for (var i = 0; i < craterCount; i++) {
        var cx = Math.random() * width, cy = Math.random() * height;
        var cr = Math.random() * 20 + 3;
        var depth = Math.random() * 40 + 10;
        ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI*2);
        ctx.fillStyle = 'rgb(' + Math.round(r-depth) + ',' + Math.round(g-depth) + ',' + Math.round(b-depth) + ')';
        ctx.fill();
        ctx.beginPath(); ctx.arc(cx+1, cy+1, cr*0.8, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
}

// ===== 漩涡纹理（金星风格）=====
function createSwirlTexture(width, height, colors) {
    var canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    var ctx = canvas.getContext('2d');
    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            var n1 = SimplexNoise.noise2D(i/60, j/60);
            var n2 = SimplexNoise.noise2D(i/30, j/30 + 5.5);
            var mix = (n1 * 0.6 + n2 * 0.4) * 0.5 + 0.5;
            var ci = Math.floor(mix * (colors.length - 1));
            var local = mix * (colors.length - 1) - ci;
            if (ci >= colors.length - 1) { ci = colors.length - 2; local = 1; }
            var r = colors[ci][0] + (colors[ci+1][0] - colors[ci][0]) * local;
            var g = colors[ci][1] + (colors[ci+1][1] - colors[ci][1]) * local;
            var b = colors[ci][2] + (colors[ci+1][2] - colors[ci][2]) * local;
            ctx.fillStyle = 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
            ctx.fillRect(i, j, 1, 1);
        }
    }
    return new THREE.CanvasTexture(canvas);
}

// ===== 太阳程序化纹理 =====
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

// ===== 行星纹理分发器（带缓存）=====
var textureCache = {};

function getPlanetTexture(p) {
    var w = 512, h = 256;
    if (p.texType === 'earth_real') {
        var loader = new THREE.TextureLoader();
        var tex = loader.load(
            'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
            function(t) { t.needsUpdate = true; },
            undefined,
            function() {}
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
    return createBandTexture(w, h, [
        [0, 200,180,160], [0.5, 220,200,180], [1.0, 200,180,160]
    ], { scale:5, amount:5 });
}
