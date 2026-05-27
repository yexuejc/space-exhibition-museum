// ===== 太空探索博物馆 - 小行星带 =====
// 在火星(22)与木星(28)轨道之间生成粒子小行星带

function createAsteroidBelt() {
    var scene = SPACEDEMO.scene;
    // 小行星带内径/外径
    var innerR = 23.5;
    var outerR = 27.5;
    var count = 4000;

    var positions = new Float32Array(count * 3);
    var sizes = new Float32Array(count);
    var colors = new Float32Array(count * 3);

    for (var i = 0; i < count; i++) {
        // 在环带范围内随机位置
        var angle = Math.random() * Math.PI * 2;
        var r = innerR + Math.random() * (outerR - innerR);
        // 略微在垂直方向上散布
        var yOffset = (Math.random() - 0.5) * 1.5;

        positions[i * 3] = Math.cos(angle) * r;
        positions[i * 3 + 1] = yOffset;
        positions[i * 3 + 2] = Math.sin(angle) * r;

        sizes[i] = Math.random() * 0.3 + 0.08;

        // 颜色从灰色到棕色
        var gray = 0.5 + Math.random() * 0.5;
        colors[i * 3] = 0.5 + Math.random() * 0.3;     // R
        colors[i * 3 + 1] = 0.4 + Math.random() * 0.3; // G
        colors[i * 3 + 2] = 0.3 + Math.random() * 0.3; // B
    }

    var geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // 创建圆形小点纹理
    var canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    var ctx = canvas.getContext('2d');
    var grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(200,200,200,0.8)');
    grad.addColorStop(1, 'rgba(200,200,200,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    var dotTexture = new THREE.CanvasTexture(canvas);

    var mat = new THREE.PointsMaterial({
        size: 0.25,
        map: dotTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    var asteroidField = new THREE.Points(geom, mat);
    scene.add(asteroidField);
    SPACEDEMO.asteroids = asteroidField;

    // 第二层更稀疏的延伸带（柯伊伯带风格）
    var count2 = 800;
    var pos2 = new Float32Array(count2 * 3);
    for (var i = 0; i < count2; i++) {
        var angle = Math.random() * Math.PI * 2;
        var r = 40 + Math.random() * 15;
        var yOffset = (Math.random() - 0.5) * 3;
        pos2[i * 3] = Math.cos(angle) * r;
        pos2[i * 3 + 1] = yOffset;
        pos2[i * 3 + 2] = Math.sin(angle) * r;
    }
    var geom2 = new THREE.BufferGeometry();
    geom2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
    var mat2 = new THREE.PointsMaterial({
        size: 0.15,
        color: 0x88aacc,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });
    var kuiperBelt = new THREE.Points(geom2, mat2);
    scene.add(kuiperBelt);
    SPACEDEMO.kuiperBelt = kuiperBelt;
}

// 每帧更新小行星带旋转
function updateAsteroids() {
    if (SPACEDEMO.asteroids) {
        SPACEDEMO.asteroids.rotation.y += 0.0003;
    }
    if (SPACEDEMO.kuiperBelt) {
        SPACEDEMO.kuiperBelt.rotation.y -= 0.0001;
    }
}
