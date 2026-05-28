// ===== 太空探索博物馆 - 小行星带 =====
// 在火星(22)与木星(28)轨道之间生成粒子小行星带

function createAsteroidBelt() {
    var scene = SPACEDEMO.scene;
    // 小行星带内径/外径
    var innerR = 23.5;
    var outerR = 27.5;
    var count = 6000;  // 从4000增加到6000

    var positions = new Float32Array(count * 3);
    var sizes = new Float32Array(count);
    var colors = new Float32Array(count * 3);

    // 更大尺寸的小行星（模拟较大天体）
    var largeCount = 200;
    var largePos = new Float32Array(largeCount * 3);
    var largeSizes = new Float32Array(largeCount);

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

        // 部分大粒子作为"较大"的小行星
        if (i < largeCount) {
            largePos[i * 3] = positions[i * 3];
            largePos[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
            largePos[i * 3 + 2] = positions[i * 3 + 2];
            largeSizes[i] = Math.random() * 0.6 + 0.4;
        }
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
        size: 0.22,
        map: dotTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    var asteroidField = new THREE.Points(geom, mat);
    scene.add(asteroidField);
    SPACEDEMO.asteroids = asteroidField;

    // 较大的小行星（独立大粒子层）
    if (largeCount > 0) {
        var lgGeom = new THREE.BufferGeometry();
        lgGeom.setAttribute('position', new THREE.BufferAttribute(largePos, 3));
        var lgMat = new THREE.PointsMaterial({
            size: 0.5,
            map: dotTexture,
            color: 0xbbaa88,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });
        var largeField = new THREE.Points(lgGeom, lgMat);
        scene.add(largeField);
        SPACEDEMO.largeAsteroids = largeField;
    }

    // 第二层更稀疏的延伸带（柯伊伯带风格）
    var count2 = 1500;  // 从800增加到1500
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
        size: 0.12,
        color: 0x88aacc,
        transparent: true,
        opacity: 0.35,
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
        SPACEDEMO.asteroids.rotation.y += 0.0004;
    }
    if (SPACEDEMO.largeAsteroids) {
        SPACEDEMO.largeAsteroids.rotation.y += 0.0004;
    }
    if (SPACEDEMO.kuiperBelt) {
        SPACEDEMO.kuiperBelt.rotation.y -= 0.00015;
    }
}
