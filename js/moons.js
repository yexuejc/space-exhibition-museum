// ===== 太空探索博物馆 - 卫星系统 =====
// 地球的月球 + 木星四大卫星（伽利略卫星）

var moonObjects = [];

function createMoons() {
    var scene = SPACEDEMO.scene;

    // ===== 地球的卫星：月球 =====
    var earthEntry = null;
    SPACEDEMO.planets.forEach(function(p) {
        if (p.data.name === '地球') earthEntry = p;
    });

    if (earthEntry) {
        var moonRadius = 0.25; // 相对大小
        var moonDist = 2.8;    // 与地球的距离

        // 月球纹理 - 程序化陨石坑
        var moonTex = createCraterTexture(256, 128, 0xaaaaaa, 60);

        var moonMesh = new THREE.Mesh(
            new THREE.SphereGeometry(moonRadius, 24, 24),
            new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.9, metalness: 0.0 })
        );
        scene.add(moonMesh);

        // 添加到场景根节点（不是地球子节点），便于独立运动
        var moonObj = {
            mesh: moonMesh,
            parent: earthEntry.mesh,
            distance: moonDist,
            speed: 0.8, // 公转速度系数
            angle: Math.random() * Math.PI * 2,
            radius: moonRadius
        };
        moonObjects.push(moonObj);

        // 月球标签
        if (SPACEDEMO.labelRenderer && typeof THREE.CSS2DObject !== 'undefined') {
            var div = document.createElement('div');
            div.className = 'planet-label moon-label';
            div.innerHTML = '🌙 月球<span class="label-sub">27.3天</span>';
            var label = new THREE.CSS2DObject(div);
            label.position.set(0, moonRadius + 0.5, 0);
            moonMesh.add(label);
        }
    }

    // ===== 木星的卫星（伽利略卫星）=====
    var jupiterEntry = null;
    SPACEDEMO.planets.forEach(function(p) {
        if (p.data.name === '木星') jupiterEntry = p;
    });

    if (jupiterEntry) {
        var galileanMoons = [
            { name:'伊奥', radius:0.18, dist:3.5, speed:1.8, color:0xcc8844 },
            { name:'欧罗巴', radius:0.15, dist:4.8, speed:1.4, color:0x88aacc },
            { name:'盖尼米得', radius:0.22, dist:6.2, speed:1.0, color:0x998877 },
            { name:'卡利斯托', radius:0.20, dist:8.0, speed:0.7, color:0x887766 }
        ];

        galileanMoons.forEach(function(m) {
            var tex = createCraterTexture(128, 64, m.color, 30);
            var mesh = new THREE.Mesh(
                new THREE.SphereGeometry(m.radius, 16, 16),
                new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0.0 })
            );
            scene.add(mesh);

            var moonObj = {
                mesh: mesh,
                parent: jupiterEntry.mesh,
                distance: m.dist,
                speed: m.speed,
                angle: Math.random() * Math.PI * 2,
                radius: m.radius
            };
            moonObjects.push(moonObj);
        });
    }
}

// 每帧更新卫星位置
function updateMoons() {
    moonObjects.forEach(function(m) {
        // 围绕母行星公转
        m.angle += 0.005 * m.speed;
        var parentPos = m.parent.position;
        m.mesh.position.x = parentPos.x + Math.cos(m.angle) * m.distance;
        m.mesh.position.z = parentPos.z + Math.sin(m.angle) * m.distance;
        m.mesh.position.y = parentPos.y + Math.sin(m.angle * 0.3) * 0.3; // 轻微轨道倾斜
        m.mesh.rotation.y += 0.02;
    });
}
