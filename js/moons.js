// ===== 太空探索博物馆 - 卫星系统 =====
// 地球的月球（含月相）+ 木星四大卫星（伽利略卫星）

(function(SPACEDEMO, win, doc, THREE, undefined) {
    "use strict";


var moonObjects = [];
var moonPhaseAngle = 0; // 月相角度（0~2PI）
var moonPhaseName = ''; // 月相中文名

// 月球科学数据
var moonSciData = {
    name:'月球', icon:'🌙',
    info:{ ch:'地球唯一的天然卫星，表面布满陨石坑，潮汐锁定。',
           en:'Earth\'s only natural satellite, cratered surface, tidally locked.' },
    sci:{
        diameter:'3,474 km',
        mass:'7.35×10²² kg',
        gravity:'1.62 m/s²',
        density:'3.34 g/cm³',
        temp:'-173~127°C',
        atmosphere:'极稀薄（钠、钾、氩）',
        moons:0,
        auDist:'0.00257 AU',
        dayLength:'27.3 天',
        yearLength:'27.3 天',
        axialTilt:'1.54°',
        discoverer:'—',
        discoverYear:'—'
    }
};

function createMoons() {
    var scene = SPACEDEMO.scene;

    // ===== 地球的卫星：月球 =====
    var earthEntry = null;
    SPACEDEMO.planets.forEach(function(p) {
        if (p.data.name === '地球') earthEntry = p;
    });

    if (earthEntry) {
        var moonRadius = 0.28;
        var moonDist = 2.8;

        // 生成高细节月球纹理（灰白基底+陨石坑）
        var texCanvas = document.createElement('canvas');
        texCanvas.width = 512; texCanvas.height = 256;
        var tctx = texCanvas.getContext('2d');

        // 灰白渐变基底
        var grad = tctx.createRadialGradient(256, 128, 0, 256, 128, 256);
        grad.addColorStop(0, '#ddddcc');
        grad.addColorStop(0.4, '#bbbbaa');
        grad.addColorStop(0.7, '#999988');
        grad.addColorStop(1, '#777766');
        tctx.fillStyle = grad;
        tctx.fillRect(0, 0, 512, 256);

        // 月海（暗色区域）
        var marias = [
            { x:180, y:140, rx:40, ry:30, c:'rgba(80,75,65,0.5)' },
            { x:220, y:120, rx:30, ry:25, c:'rgba(90,85,75,0.4)' },
            { x:300, y:135, rx:35, ry:28, c:'rgba(85,80,70,0.45)' },
            { x:160, y:110, rx:25, ry:20, c:'rgba(75,70,60,0.35)' },
            { x:350, y:130, rx:20, ry:18, c:'rgba(80,75,65,0.3)' }
        ];
        marias.forEach(function(m) {
            tctx.beginPath();
            tctx.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI*2);
            tctx.fillStyle = m.c;
            tctx.fill();
        });

        // 陨石坑（大+小随机）
        for (var i = 0; i < 180; i++) {
            var x = Math.random() * 512, y = Math.random() * 256;
            var r = Math.random() * 12 + 2;
            // 坑边缘亮
            tctx.beginPath();
            tctx.arc(x, y, r, 0, Math.PI*2);
            tctx.fillStyle = 'rgba(140,130,120,' + (Math.random()*0.3+0.1) + ')';
            tctx.fill();
            // 坑内部暗
            tctx.beginPath();
            tctx.arc(x, y, r*0.7, 0, Math.PI*2);
            tctx.fillStyle = 'rgba(60,55,50,' + (Math.random()*0.2+0.05) + ')';
            tctx.fill();
        }

        var baseMoonTex = new THREE.CanvasTexture(texCanvas);

        // 使用 ShaderMaterial 实现月相
        var moonMat = new THREE.ShaderMaterial({
            uniforms: {
                uTex: { value: baseMoonTex },
                uPhase: { value: 0 },
                uSunDir: { value: new THREE.Vector3(1, 0, 0) }
            },
            vertexShader: [
                'varying vec2 vUv;',
                'varying vec3 vNormal;',
                'varying vec3 vPosition;',
                'void main() {',
                '  vUv = uv;',
                '  vNormal = normalize(normalMatrix * normal);',
                '  vec4 worldPos = modelMatrix * vec4(position, 1.0);',
                '  vPosition = worldPos.xyz;',
                '  gl_Position = projectionMatrix * viewMatrix * worldPos;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform sampler2D uTex;',
                'uniform float uPhase;',
                'uniform vec3 uSunDir;',
                'varying vec2 vUv;',
                'varying vec3 vNormal;',
                'varying vec3 vPosition;',
                'void main() {',
                '  vec3 texColor = texture2D(uTex, vUv).rgb;',
                '  // 计算光照方向（从月球指向太阳）',
                '  vec3 lightDir = normalize(uSunDir);',
                '  float diff = dot(vNormal, lightDir);',
                '  // 光滑过渡：diff < 0 为暗面，> 0 为亮面',
                '  float lighting = smoothstep(-0.2, 0.2, diff);',
                '  // 暗面微微可见（地球反照）',
                '  float earthshine = 0.05;',
                '  vec3 finalColor = texColor * (lighting * 0.9 + earthshine);',
                '  // 亮面略带暖色',
                '  finalColor += texColor * lighting * 0.1 * vec3(1.0, 0.95, 0.85);',
                '  gl_FragColor = vec4(finalColor, 1.0);',
                '}'
            ].join('\n')
        });

        var moonMesh = new THREE.Mesh(
            new THREE.SphereGeometry(moonRadius, 32, 32),
            moonMat
        );
        scene.add(moonMesh);
        SPACEDEMO.moonMesh = moonMesh;
        SPACEDEMO.moonMat = moonMat;

        var moonObj = {
            mesh: moonMesh,
            parent: earthEntry.mesh,
            distance: moonDist,
            speed: 2.5, // 月球公转速度系数
            angle: Math.random() * Math.PI * 2,
            radius: moonRadius,
            mat: moonMat
        };
        moonObjects.push(moonObj);

        // 月球加入可点击列表
        if (SPACEDEMO.clickables) {
            moonMesh.userData = { name: '月球', isMoon: true };
            SPACEDEMO.clickables.push(moonMesh);
        }

        // 月球标签
        if (SPACEDEMO.labelRenderer && typeof THREE.CSS2DObject !== 'undefined') {
            var div = document.createElement('div');
            div.className = 'planet-label moon-label';
            div.innerHTML = '🌙 月球<span class="label-sub">27.3天</span>';
            var label = new THREE.CSS2DObject(div);
            label.position.set(0, moonRadius + 0.5, 0);
            moonMesh.add(label);
            SPACEDEMO.labelObjects.push({ label: label, data: moonSciData, div: div });
        }

        // 月球轨道线（细圆环）
        var orbSegs = 32;
        var orbPts = [];
        for (var i = 0; i <= orbSegs; i++) {
            var theta = (i / orbSegs) * Math.PI * 2;
            var earthPos = earthEntry.mesh.position;
            orbPts.push(new THREE.Vector3(
                earthPos.x + Math.cos(theta) * moonDist,
                earthPos.y,
                earthPos.z + Math.sin(theta) * moonDist
            ));
        }
        var orbGeom = new THREE.BufferGeometry().setFromPoints(orbPts);
        var orbMat = new THREE.LineBasicMaterial({
            color: 0x888899, transparent: true, opacity: 0.1
        });
        var orbLine = new THREE.Line(orbGeom, orbMat);
        scene.add(orbLine);
        SPACEDEMO.moonOrbitLine = orbLine;
    }

    // ===== 木星的卫星（伽利略卫星）=====
    var jupiterEntry = null;
    SPACEDEMO.planets.forEach(function(p) {
        if (p.data.name === '木星') jupiterEntry = p;
    });

    if (jupiterEntry) {
        var galileanMoons = [
            { name:'伊奥', en:'Io', radius:0.18, dist:3.5, speed:1.8, color:0xcc8844 },
            { name:'欧罗巴', en:'Europa', radius:0.15, dist:4.8, speed:1.4, color:0x88aacc },
            { name:'盖尼米得', en:'Ganymede', radius:0.22, dist:6.2, speed:1.0, color:0x998877 },
            { name:'卡利斯托', en:'Callisto', radius:0.20, dist:8.0, speed:0.7, color:0x887766 }
        ];

        galileanMoons.forEach(function(m) {
            var tex = createCraterTexture(128, 64, m.color, 30);
            var mesh = new THREE.Mesh(
                new THREE.SphereGeometry(m.radius, 16, 16),
                new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0.0 })
            );
            scene.add(mesh);

            // 可点击
            mesh.userData = { name: m.name, enName: m.en, isLargeMoon: true, parentName: '木星' };
            if (SPACEDEMO.clickables) SPACEDEMO.clickables.push(mesh);

            var moonObj = {
                mesh: mesh,
                parent: jupiterEntry.mesh,
                distance: m.dist,
                speed: m.speed,
                angle: Math.random() * Math.PI * 2,
                radius: m.radius,
                data: m
            };
            moonObjects.push(moonObj);

            // 标签
            if (SPACEDEMO.labelRenderer && typeof THREE.CSS2DObject !== 'undefined') {
                var div = document.createElement('div');
                div.className = 'planet-label moon-label';
                div.innerHTML = '🛰️ ' + m.name + '<span class="label-sub">木卫</span>';
                var label = new THREE.CSS2DObject(div);
                label.position.set(0, m.radius + 0.3, 0);
                mesh.add(label);
                SPACEDEMO.labelObjects.push({ label: label, data: m, div: div });
            }
        });
    }

    // ===== 土星的卫星：土卫六 =====
    var saturnEntry = null;
    SPACEDEMO.planets.forEach(function(p) {
        if (p.data.name === '土星') saturnEntry = p;
    });

    if (saturnEntry) {
        var titanRadius = 0.20;
        var titanDist = 5.5;
        var titanTex = createCraterTexture(128, 64, 0xcc8844, 25);
        var titanMesh = new THREE.Mesh(
            new THREE.SphereGeometry(titanRadius, 16, 16),
            new THREE.MeshStandardMaterial({ map: titanTex, roughness: 0.7, metalness: 0.0 })
        );
        scene.add(titanMesh);

        titanMesh.userData = { name: '土卫六', enName: 'Titan', isLargeMoon: true, parentName: '土星' };
        if (SPACEDEMO.clickables) SPACEDEMO.clickables.push(titanMesh);

        var titanObj = {
            mesh: titanMesh,
            parent: saturnEntry.mesh,
            distance: titanDist,
            speed: 0.5,
            angle: Math.random() * Math.PI * 2,
            radius: titanRadius,
            data: { name:'土卫六', en:'Titan' }
        };
        moonObjects.push(titanObj);

        if (SPACEDEMO.labelRenderer && typeof THREE.CSS2DObject !== 'undefined') {
            var div = document.createElement('div');
            div.className = 'planet-label moon-label';
            div.innerHTML = '🛰️ 土卫六<span class="label-sub">Titan</span>';
            var label = new THREE.CSS2DObject(div);
            label.position.set(0, titanRadius + 0.3, 0);
            titanMesh.add(label);
            SPACEDEMO.labelObjects.push({ label: label, data: { name:'土卫六', en:'Titan' }, div: div });
        }
    }
}

// 获取月相名称
function getMoonPhaseName(angle) {
    // angle: 0 = 新月, PI/2 = 上弦月, PI = 满月, 3PI/2 = 下弦月
    var dayAngle = angle % (Math.PI * 2);
    if (dayAngle < 0) dayAngle += Math.PI * 2;
    if (dayAngle < 0.25 || dayAngle >= 6.0) return '🌑 新月';
    if (dayAngle < 1.0) return '🌒 蛾眉月';
    if (dayAngle < 1.8) return '🌓 上弦月';
    if (dayAngle < 2.5) return '🌔 盈凸月';
    if (dayAngle < 3.8) return '🌕 满月';
    if (dayAngle < 4.5) return '🌖 亏凸月';
    if (dayAngle < 5.3) return '🌗 下弦月';
    return '🌘 残月';
}

// 每帧更新卫星位置
function updateMoons() {
    // 更新所有卫星位置
    moonObjects.forEach(function(m) {
        m.angle += 0.015 * (SPACEDEMO.speedMultiplier || 1) * m.speed * 0.02;
        var parentPos = m.parent.position;
        m.mesh.position.set(
            parentPos.x + Math.cos(m.angle) * m.distance,
            parentPos.y + Math.sin(m.angle) * 0.3, // 小倾角
            parentPos.z + Math.sin(m.angle) * m.distance
        );
    });

    // 更新月相
    var moonObj = moonObjects.length > 0 ? moonObjects[0] : null;
    if (moonObj && SPACEDEMO.moonMat) {
        var moonPos = moonObj.mesh.position;
        // 太阳方向（从月球指向太阳）
        var sunDir = new THREE.Vector3().copy(moonPos).negate().normalize();
        SPACEDEMO.moonMat.uniforms.uSunDir.value.copy(sunDir);

        // 计算月相角度（地月连线与日地连线的夹角）
        var earthPos = moonObj.parent.position;
        var earthToMoon = new THREE.Vector3().copy(moonPos).sub(earthPos).normalize();
        var earthToSun = new THREE.Vector3().copy(earthPos).negate().normalize();
        var phaseDot = earthToMoon.dot(earthToSun);
        moonPhaseAngle = Math.acos(Math.max(-1, Math.min(1, phaseDot)));
        // 确定是左半亮还是右半亮
        var cross = new THREE.Vector3().crossVectors(earthToMoon, earthToSun);
        if (cross.y < 0) moonPhaseAngle = Math.PI * 2 - moonPhaseAngle;
        moonPhaseName = getMoonPhaseName(moonPhaseAngle);
    }

    // 更新月球轨道线位置（跟随地球）
    if (SPACEDEMO.moonOrbitLine) {
        var earthEntry = null;
        SPACEDEMO.planets.forEach(function(p) {
            if (p.data.name === '地球') earthEntry = p;
        });
        if (earthEntry) {
            var pts = SPACEDEMO.moonOrbitLine.geometry.attributes.position.array;
            var dist = 2.8;
            var ePos = earthEntry.mesh.position;
            for (var i = 0; i <= 32; i++) {
                var theta = (i / 32) * Math.PI * 2;
                pts[i*3] = ePos.x + Math.cos(theta) * dist;
                pts[i*3+1] = ePos.y;
                pts[i*3+2] = ePos.z + Math.sin(theta) * dist;
            }
            SPACEDEMO.moonOrbitLine.geometry.attributes.position.needsUpdate = true;
        }
    }
}


    // 公开接口
    SPACEDEMO.createMoons = createMoons;
    win.createMoons = createMoons;
    SPACEDEMO.updateMoons = updateMoons;
    win.updateMoons = updateMoons;
    SPACEDEMO.getMoonPhaseName = getMoonPhaseName;
    win.getMoonPhaseName = getMoonPhaseName;
    SPACEDEMO.moonSciData = moonSciData;
    win.moonSciData = moonSciData;
    SPACEDEMO.moonPhaseAngle = moonPhaseAngle;
    win.moonPhaseAngle = moonPhaseAngle;
    SPACEDEMO.moonPhaseName = moonPhaseName;
    win.moonPhaseName = moonPhaseName;
})(window.SPACEDEMO || (window.SPACEDEMO = {}), window, document, window.THREE);
