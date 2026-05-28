// ===== 太空探索博物馆 - 3D 太阳系场景 =====
// 场景创建、太阳、行星、轨道、标注、星空

var SPACEDEMO = {};

function buildSolarSystem() {
    var container = document.getElementById('vrContainer');
    SPACEDEMO.container = container;

    // ===== 场景 =====
    var scene = new THREE.Scene();
    SPACEDEMO.scene = scene;

    // ===== 相机 =====
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 60, 100);
    SPACEDEMO.camera = camera;

    // ===== 渲染器 =====
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    SPACEDEMO.renderer = renderer;

    // ===== CSS2 渲染器（标签）=====
    var labelRenderer = null;
    if (typeof THREE.CSS2DRenderer !== 'undefined') {
        labelRenderer = new THREE.CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0';
        labelRenderer.domElement.style.pointerEvents = 'none';
        container.appendChild(labelRenderer.domElement);
    }
    SPACEDEMO.labelRenderer = labelRenderer;

    // ===== 轨道控制器 =====
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.05;
    controls.maxDistance = 180;
    controls.zoomSpeed = 1.2;
    controls.rotateSpeed = 0.5;
    controls.target.set(0, 0, 0);
    SPACEDEMO.controls = controls;

    // ===== 环境光与点光源（昼夜模式）=====
    // 低环境光 + 强太阳光 = 自然日/夜面效果
    var ambient = new THREE.AmbientLight(0x222244, 0.15);
    scene.add(ambient);
    var sunLight = new THREE.PointLight(0xffffff, 3.5, 500);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);
    // 微弱的背光补光，避免背光面全黑
    var fillLight = new THREE.HemisphereLight(0x224488, 0x001122, 0.3);
    scene.add(fillLight);

    // ===== 星空背景（Three.js 粒子 - 闪烁 Shader）=====
    var starCount = 3000;
    var starGeom = new THREE.BufferGeometry();
    var starPos = new Float32Array(starCount * 3);
    var starSizes = new Float32Array(starCount);
    var starPhases = new Float32Array(starCount); // 每颗星星的闪烁相位
    var starSpeeds = new Float32Array(starCount); // 闪烁速度
    for (var i = 0; i < starCount; i++) {
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.acos(2 * Math.random() - 1);
        var r = 500 + Math.random() * 500;
        starPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i*3+2] = r * Math.cos(phi);
        starSizes[i] = Math.random() * 2.5 + 0.5;
        starPhases[i] = Math.random() * Math.PI * 2;
        starSpeeds[i] = 0.5 + Math.random() * 1.5;
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeom.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    starGeom.setAttribute('phase', new THREE.BufferAttribute(starPhases, 1));
    starGeom.setAttribute('speed', new THREE.BufferAttribute(starSpeeds, 1));

    var starMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
        },
        vertexShader: [
            'attribute float size;',
            'attribute float phase;',
            'attribute float speed;',
            'uniform float uTime;',
            'uniform float uPixelRatio;',
            'varying float vAlpha;',
            'void main() {',
            '    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
            '    float twinkle = 0.6 + 0.4 * sin(uTime * speed + phase);',
            '    vAlpha = twinkle;',
            '    gl_PointSize = size * uPixelRatio * (200.0 / -mvPosition.z);',
            '    gl_Position = projectionMatrix * mvPosition;',
            '}'
        ].join('\n'),
        fragmentShader: [
            'varying float vAlpha;',
            'void main() {',
            '    vec2 center = gl_PointCoord - vec2(0.5);',
            '    float dist = length(center);',
            '    if (dist > 0.5) discard;',
            '    float glow = 1.0 - smoothstep(0.0, 0.5, dist);',
            '    glow = pow(glow, 1.5);',
            '    vec3 color = mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 0.95, 0.8), dist * 2.0);',
            '    gl_FragColor = vec4(color, glow * vAlpha * 0.9);',
            '}'
        ].join('\n'),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    var starField = new THREE.Points(starGeom, starMat);
    scene.add(starField);
    SPACEDEMO.starMat = starMat;

    // ===== 太阳 =====
    var sun = new THREE.Mesh(
        new THREE.SphereGeometry(SUN_RADIUS, 48, 48),
        new THREE.MeshBasicMaterial({ map: createSunProcedural() })
    );
    scene.add(sun);
    SPACEDEMO.sun = sun;

    // 太阳光晕（动态 Shader 辉光）
    var glowMat = new THREE.ShaderMaterial({
        vertexShader: [
            'varying vec3 vNormal;',
            'void main() {',
            '    vNormal = normalize(normalMatrix * normal);',
            '    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform float uTime;',
            'varying vec3 vNormal;',
            'void main() {',
            '    float pulse = 0.85 + 0.15 * sin(uTime * 0.8);',
            '    float glow = 1.0 - abs(vNormal.z);',
            '    glow = pow(glow, 2.0) * pulse;',
            '    vec3 color = mix(vec3(1.0, 0.6, 0.1), vec3(1.0, 0.2, 0.0), glow);',
            '    gl_FragColor = vec4(color, glow * 0.12);',
            '}'
        ].join('\n'),
        transparent: true, side: THREE.BackSide,
        blending: THREE.AdditiveBlending, depthWrite: false,
        uniforms: { uTime: { value: 0 } }
    });
    var glowMesh = new THREE.Mesh(
        new THREE.SphereGeometry(SUN_RADIUS * 1.2, 32, 32),
        glowMat
    );
    scene.add(glowMesh);
    SPACEDEMO.glowMesh = glowMesh;
    SPACEDEMO.glowMat = glowMat;

    // 外层大型光晕（缓慢旋转、更大范围）
    var outerGlowMat = new THREE.ShaderMaterial({
        vertexShader: [
            'varying vec3 vNormal;',
            'void main() {',
            '    vNormal = normalize(normalMatrix * normal);',
            '    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform float uTime;',
            'varying vec3 vNormal;',
            'void main() {',
            '    float pulse = 0.9 + 0.1 * sin(uTime * 0.5 + 1.0);',
            '    float glow = 1.0 - abs(vNormal.z);',
            '    glow = pow(glow, 3.0) * pulse;',
            '    vec3 color = vec3(1.0, 0.4, 0.05);',
            '    gl_FragColor = vec4(color, glow * 0.05);',
            '}'
        ].join('\n'),
        transparent: true, side: THREE.BackSide,
        blending: THREE.AdditiveBlending, depthWrite: false,
        uniforms: { uTime: { value: 0 } }
    });
    var outerGlow = new THREE.Mesh(
        new THREE.SphereGeometry(SUN_RADIUS * 1.5, 32, 32),
        outerGlowMat
    );
    scene.add(outerGlow);
    SPACEDEMO.outerGlowMat = outerGlowMat;

    // 太阳日冕粒子系统（低亮度版）
    var coronaParticleCount = 400;
    var coronaPos = new Float32Array(coronaParticleCount * 3);
    var coronaSizes = new Float32Array(coronaParticleCount);
    var coronaOffsets = new Float32Array(coronaParticleCount);
    var coronaSpeeds = new Float32Array(coronaParticleCount);

    for (var i = 0; i < coronaParticleCount; i++) {
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.acos(2 * Math.random() - 1);
        var r = SUN_RADIUS * (1.1 + Math.random() * 0.5);
        coronaPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        coronaPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta) * 0.3;
        coronaPos[i*3+2] = r * Math.cos(phi);
        coronaSizes[i] = Math.random() * 0.8 + 0.2;
        coronaOffsets[i] = Math.random() * Math.PI * 2;
        coronaSpeeds[i] = 0.3 + Math.random() * 0.7;
    }

    var coronaGeom = new THREE.BufferGeometry();
    coronaGeom.setAttribute('position', new THREE.BufferAttribute(coronaPos, 3));
    coronaGeom.setAttribute('size', new THREE.BufferAttribute(coronaSizes, 1));

    // 粒子纹理：柔和发光圆点
    var dotCanvas = document.createElement('canvas');
    dotCanvas.width = 32; dotCanvas.height = 32;
    var dctx = dotCanvas.getContext('2d');
    var dgrad = dctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    dgrad.addColorStop(0, 'rgba(255,255,200,1)');
    dgrad.addColorStop(0.2, 'rgba(255,200,100,0.8)');
    dgrad.addColorStop(0.5, 'rgba(255,100,30,0.4)');
    dgrad.addColorStop(1, 'rgba(255,50,0,0)');
    dctx.fillStyle = dgrad;
    dctx.fillRect(0, 0, 32, 32);
    var dotTex = new THREE.CanvasTexture(dotCanvas);

    var coronaMat = new THREE.PointsMaterial({
        size: 0.35, map: dotTex, transparent: true, opacity: 0.25,
        blending: THREE.AdditiveBlending, depthWrite: false,
        color: 0xff8833, sizeAttenuation: true
    });
    var coronaParticles = new THREE.Points(coronaGeom, coronaMat);
    scene.add(coronaParticles);
    SPACEDEMO.coronaParticles = coronaParticles;
    SPACEDEMO.coronaData = { offsets: coronaOffsets, speeds: coronaSpeeds, count: coronaParticleCount, theta: new Float32Array(coronaParticleCount) };
    // 初始化角度
    for (var i = 0; i < coronaParticleCount; i++) {
        SPACEDEMO.coronaData.theta[i] = Math.random() * Math.PI * 2;
    }

    // ===== 创建行星 =====
    var planets = [];
    var labelObjects = [];
    var clickables = [];

    planetData.forEach(function(p) {
        var tex = getPlanetTexture(p);
        var mesh = new THREE.Mesh(
            new THREE.SphereGeometry(p.radius, 48, 48),
            new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.05 })
        );
        var angle = getPlanetAngle(p);
        mesh.position.set(Math.cos(angle) * p.dist, 0, Math.sin(angle) * p.dist);
        mesh.rotation.y = getPlanetRotation(p);
        mesh.userData = p;
        scene.add(mesh);
        clickables.push(mesh);

        // ===== 地球大气层辉光效果 =====
        if (p.name === '地球') {
            // 内层大气（Fresnel 散射光晕）
            var atmosGeo = new THREE.SphereGeometry(p.radius * 1.025, 48, 48);
            var atmosMat = new THREE.ShaderMaterial({
                vertexShader: [
                    'varying vec3 vNormal;',
                    'varying vec3 vPositionW;',
                    'void main() {',
                    '    vNormal = normalize(normalMatrix * normal);',
                    '    vec4 worldPos = modelMatrix * vec4(position, 1.0);',
                    '    vPositionW = worldPos.xyz;',
                    '    gl_Position = projectionMatrix * viewMatrix * worldPos;',
                    '}'
                ].join('\n'),
                fragmentShader: [
                    'varying vec3 vNormal;',
                    'varying vec3 vPositionW;',
                    'void main() {',
                    '    vec3 viewDir = normalize(cameraPosition - vPositionW);',
                    '    float intensity = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);',
                    '    gl_FragColor = vec4(0.3, 0.6, 1.0, intensity * 0.55);',
                    '}'
                ].join('\n'),
                transparent: true, side: THREE.FrontSide,
                blending: THREE.AdditiveBlending, depthWrite: false
            });
            mesh.add(new THREE.Mesh(atmosGeo, atmosMat));

            // 外层光晕（更淡、范围更大）
            var glowGeo = new THREE.SphereGeometry(p.radius * 1.08, 32, 32);
            var glowMat = new THREE.ShaderMaterial({
                vertexShader: [
                    'varying vec3 vNormal;',
                    'varying vec3 vPositionW;',
                    'void main() {',
                    '    vNormal = normalize(normalMatrix * normal);',
                    '    vec4 worldPos = modelMatrix * vec4(position, 1.0);',
                    '    vPositionW = worldPos.xyz;',
                    '    gl_Position = projectionMatrix * viewMatrix * worldPos;',
                    '}'
                ].join('\n'),
                fragmentShader: [
                    'varying vec3 vNormal;',
                    'varying vec3 vPositionW;',
                    'void main() {',
                    '    vec3 viewDir = normalize(cameraPosition - vPositionW);',
                    '    float intensity = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 4.0);',
                    '    gl_FragColor = vec4(0.5, 0.8, 1.0, intensity * 0.2);',
                    '}'
                ].join('\n'),
                transparent: true, side: THREE.FrontSide,
                blending: THREE.AdditiveBlending, depthWrite: false
            });
            mesh.add(new THREE.Mesh(glowGeo, glowMat));

            // 背光面补光（极淡的橙色散射光，模拟晨昏线效果）
            var backGeo = new THREE.SphereGeometry(p.radius * 1.015, 32, 32);
            var backMat = new THREE.ShaderMaterial({
                vertexShader: [
                    'varying vec3 vNormal;',
                    'varying vec3 vPositionW;',
                    'void main() {',
                    '    vNormal = normalize(normalMatrix * normal);',
                    '    vec4 worldPos = modelMatrix * vec4(position, 1.0);',
                    '    vPositionW = worldPos.xyz;',
                    '    gl_Position = projectionMatrix * viewMatrix * worldPos;',
                    '}'
                ].join('\n'),
                fragmentShader: [
                    'varying vec3 vNormal;',
                    'varying vec3 vPositionW;',
                    'void main() {',
                    '    vec3 viewDir = normalize(cameraPosition - vPositionW);',
                    '    float intensity = pow(max(dot(vNormal, viewDir), 0.0), 2.0);',
                    '    gl_FragColor = vec4(1.0, 0.5, 0.2, intensity * 0.12);',
                    '}'
                ].join('\n'),
                transparent: true, side: THREE.FrontSide,
                blending: THREE.AdditiveBlending, depthWrite: false
            });
            mesh.add(new THREE.Mesh(backGeo, backMat));
        }

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

    SPACEDEMO.planets = planets;
    SPACEDEMO.labelObjects = labelObjects;
    SPACEDEMO.clickables = clickables;

    // ===== 增强轨道系统（发光轨道线 + 位置标记）=====
    SPACEDEMO.orbitMarkers = [];
    planetData.forEach(function(p) {
        var segments = 96;

        // 主轨道线（LineLoop + 发光 Shader）
        var orbitPoints = [];
        for (var i = 0; i <= segments; i++) {
            var theta = (i / segments) * Math.PI * 2;
            orbitPoints.push(new THREE.Vector3(
                Math.cos(theta) * p.dist,
                0,
                Math.sin(theta) * p.dist
            ));
        }
        var orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        var orbitMat = new THREE.ShaderMaterial({
            uniforms: {
                uColor: { value: new THREE.Color(0x4488cc) },
                uGlowColor: { value: new THREE.Color(0x88ddff) }
            },
            vertexShader: [
                'varying float vDist;',
                'void main() {',
                '    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);',
                '    vDist = -mvPos.z;',
                '    gl_Position = projectionMatrix * mvPos;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform vec3 uColor;',
                'uniform vec3 uGlowColor;',
                'varying float vDist;',
                'void main() {',
                '    float distAlpha = clamp(1.0 - vDist / 400.0, 0.2, 1.0);',
                '    float glow = pow(distAlpha, 1.5);',
                // 发光边缘
                '    vec3 color = mix(uGlowColor, uColor, glow);',
                '    gl_FragColor = vec4(color, distAlpha * 0.35);',
                '}'
            ].join('\n'),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            linewidth: 1
        });
        var orbitLine = new THREE.Line(orbitGeom, orbitMat);
        scene.add(orbitLine);

        // 轨道外发光圆环（更宽、更淡的辅助环）
        var glowRingPoints = [];
        for (var i = 0; i <= 48; i++) {
            var theta = (i / 48) * Math.PI * 2;
            var r = p.dist + 0.15;
            glowRingPoints.push(new THREE.Vector3(
                Math.cos(theta) * r,
                0,
                Math.sin(theta) * r
            ));
        }
        var glowRingGeom = new THREE.BufferGeometry().setFromPoints(glowRingPoints);
        var glowRingMat = new THREE.LineBasicMaterial({
            color: 0x4488cc, transparent: true, opacity: 0.08
        });
        var glowRing = new THREE.Line(glowRingGeom, glowRingMat);
        scene.add(glowRing);

        // 内圈细线（增加层次感）
        var innerRingPoints = [];
        for (var i = 0; i <= 32; i++) {
            var theta = (i / 32) * Math.PI * 2;
            var r = p.dist - 0.1;
            innerRingPoints.push(new THREE.Vector3(
                Math.cos(theta) * r,
                0.02,
                Math.sin(theta) * r
            ));
        }
        var innerRingGeom = new THREE.BufferGeometry().setFromPoints(innerRingPoints);
        var innerRingMat = new THREE.LineBasicMaterial({
            color: 0x66aaee, transparent: true, opacity: 0.06
        });
        var innerRing = new THREE.Line(innerRingGeom, innerRingMat);
        scene.add(innerRing);

        // 行星位置标记点（跟随行星运动的发光圆点）
        // 用 PointsMaterial 实现发光标记点
        var markerCanvas = document.createElement('canvas');
        markerCanvas.width = 32; markerCanvas.height = 32;
        var mctx = markerCanvas.getContext('2d');
        var mgrad = mctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        mgrad.addColorStop(0, 'rgba(255,255,255,1)');
        mgrad.addColorStop(0.3, 'rgba(100,200,255,0.8)');
        mgrad.addColorStop(0.6, 'rgba(50,150,255,0.3)');
        mgrad.addColorStop(1, 'rgba(0,100,255,0)');
        mctx.fillStyle = mgrad;
        mctx.fillRect(0, 0, 32, 32);
        var markerTex = new THREE.CanvasTexture(markerCanvas);

        // 标记点使用 Points + 每帧更新位置（在 app.js 主循环中处理）
        var markerGeom = new THREE.BufferGeometry();
        var markerPos = new Float32Array([0, 0, 0]);
        markerGeom.setAttribute('position', new THREE.BufferAttribute(markerPos, 3));
        var markerMat = new THREE.PointsMaterial({
            size: 0.8, map: markerTex, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending, depthWrite: false,
            color: 0x88ddff, sizeAttenuation: true
        });
        var marker = new THREE.Points(markerGeom, markerMat);
        scene.add(marker);

        // 保存轨道标记数据，主循环更新位置
        SPACEDEMO.orbitMarkers.push({
            marker: marker,
            dist: p.dist,
            planetData: p
        });
    });

    // ===== 矮行星：冥王星 =====
    // 查找冥王星数据
    var plutoData = null;
    planetData.forEach(function(p) { if (p.name === '冥王星') plutoData = p; });
    if (plutoData) {
        var plutoTex = getPlanetTexture(plutoData);
        var plutoMesh = new THREE.Mesh(
            new THREE.SphereGeometry(plutoData.radius, 32, 32),
            new THREE.MeshStandardMaterial({ map: plutoTex, roughness: 0.8, metalness: 0.02 })
        );
        // 初始位置（使用倾斜轨道计算）
        var pAngle = getPlanetAngle(plutoData);
        var pIncline = (plutoData.orbitalInclination || 0) * Math.PI / 180;
        var pDist = plutoData.dist;
        plutoMesh.position.set(
            Math.cos(pAngle) * pDist,
            Math.sin(pAngle) * pDist * Math.sin(pIncline),
            Math.sin(pAngle) * pDist * Math.cos(pIncline)
        );
        plutoMesh.rotation.y = getPlanetRotation(plutoData);
        plutoMesh.userData = plutoData;
        scene.add(plutoMesh);
        clickables.push(plutoMesh);

        // 保存冥王星引用
        SPACEDEMO.pluto = { mesh: plutoMesh, data: plutoData };

        // CSS2D 标签（矮行星专用样式）
        if (labelRenderer && typeof THREE.CSS2DObject !== 'undefined') {
            var div = document.createElement('div');
            div.className = 'planet-label dwarf-label';
            div.innerHTML = '<span class="label-icon">♇</span>冥王星<span class="label-sub">矮行星</span>';
            var label = new THREE.CSS2DObject(div);
            label.position.set(0, plutoData.radius + 1.0, 0);
            plutoMesh.add(label);
            labelObjects.push({ label: label, data: plutoData, div: div });
        }

        // 冥王星的轨道线（倾斜椭圆）
        var orbSegs = 64;
        var orbPts = [];
        for (var i = 0; i <= orbSegs; i++) {
            var theta = (i / orbSegs) * Math.PI * 2;
            var incl = (plutoData.orbitalInclination || 0) * Math.PI / 180;
            var ecc = plutoData.orbitalEccentricity || 0;
            // 椭圆形状
            var r = pDist * (1 - ecc * ecc) / (1 + ecc * Math.cos(theta));
            orbPts.push(new THREE.Vector3(
                Math.cos(theta) * r,
                Math.sin(theta) * r * Math.sin(incl),
                Math.sin(theta) * r * Math.cos(incl)
            ));
        }
        var orbGeom = new THREE.BufferGeometry().setFromPoints(orbPts);
        var orbMat = new THREE.LineBasicMaterial({
            color: 0x887766, transparent: true, opacity: 0.15
        });
        scene.add(new THREE.Line(orbGeom, orbMat));
    }

    // ===== 彗星 =====
    if (typeof cometData !== 'undefined') {
        // 彗核（不规则冰质小球）
        var cometGeom = new THREE.SphereGeometry(cometData.radius, 16, 16);
        // 轻微随机变形模拟不规则彗核
        var posAttr = cometGeom.attributes.position;
        for (var i = 0; i < posAttr.count; i++) {
            var x = posAttr.getX(i), y = posAttr.getY(i), z = posAttr.getZ(i);
            var scale = 1 + (Math.random() - 0.5) * 0.3;
            posAttr.setXYZ(i, x * scale, y * scale, z * scale);
        }
        posAttr.needsUpdate = true;
        cometGeom.computeVertexNormals();
        var cometMat = new THREE.MeshStandardMaterial({
            color: 0xccddff, roughness: 0.6, metalness: 0.05, emissive: 0x4466aa, emissiveIntensity: 0.1
        });
        var cometMesh = new THREE.Mesh(cometGeom, cometMat);
        // 初始位置：近日点附近
        var initAngle = Math.random() * Math.PI * 2;
        cometMesh.userData = cometData;
        scene.add(cometMesh);
        clickables.push(cometMesh);

        // 彗星尾粒子系统
        var TAIL_COUNT = 120;
        var tailPositions = new Float32Array(TAIL_COUNT * 3);
        var tailGeom = new THREE.BufferGeometry();
        tailGeom.setAttribute('position', new THREE.BufferAttribute(tailPositions, 3));

        // 为每个粒子预生成随机偏移（固定，避免每帧闪烁）
        var tailSeedAngles = new Float32Array(TAIL_COUNT);
        var tailSeedOffsets = new Float32Array(TAIL_COUNT * 2);
        for (var i = 0; i < TAIL_COUNT; i++) {
            tailSeedAngles[i] = Math.random() * Math.PI * 2;
            tailSeedOffsets[i*2] = Math.random();
            tailSeedOffsets[i*2+1] = Math.random();
        }

        // 粒子圆形渐变纹理
        var canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        var ctx = canvas.getContext('2d');
        var grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.2, 'rgba(200,230,255,0.8)');
        grad.addColorStop(0.5, 'rgba(150,200,255,0.3)');
        grad.addColorStop(1, 'rgba(100,150,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        var dotTexture = new THREE.CanvasTexture(canvas);

        var tailMat = new THREE.PointsMaterial({
            size: 1.5,
            map: dotTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            color: 0x88ccff,
            opacity: 0.6
        });
        var tailPoints = new THREE.Points(tailGeom, tailMat);
        scene.add(tailPoints);

        // 保存彗星引用
        SPACEDEMO.comet = {
            mesh: cometMesh,
            data: cometData,
            tailPoints: tailPoints,
            tailGeom: tailGeom,
            tailMat: tailMat,
            tailCount: TAIL_COUNT,
            tailSeedAngles: tailSeedAngles,
            tailSeedOffsets: tailSeedOffsets,
            angle: initAngle
        };

        // 彗星的轨道线（高偏心椭圆 + 倾斜）
        var orbSegs = 72;
        var orbPts = [];
        for (var i = 0; i <= orbSegs; i++) {
            var theta = (i / orbSegs) * Math.PI * 2;
            var incl = (cometData.orbitalInclination || 0) * Math.PI / 180;
            var a = (cometData.perihelionDist + cometData.aphelionDist) / 2;
            var ecc = (cometData.aphelionDist - cometData.perihelionDist) / (cometData.perihelionDist + cometData.aphelionDist);
            var r = a * (1 - ecc * ecc) / (1 + ecc * Math.cos(theta));
            orbPts.push(new THREE.Vector3(
                Math.cos(theta) * r,
                Math.sin(theta) * r * Math.sin(incl),
                Math.sin(theta) * r * Math.cos(incl)
            ));
        }
        var orbGeom = new THREE.BufferGeometry().setFromPoints(orbPts);
        var orbMat = new THREE.LineBasicMaterial({
            color: 0x4477aa, transparent: true, opacity: 0.1
        });
        scene.add(new THREE.Line(orbGeom, orbMat));

        // 彗星CSS2D标签
        if (labelRenderer && typeof THREE.CSS2DObject !== 'undefined') {
            var div = document.createElement('div');
            div.className = 'planet-label comet-label';
            div.innerHTML = '<span class="label-icon">☄️</span>哈雷彗星';
            var label = new THREE.CSS2DObject(div);
            label.position.set(0, cometData.radius + 1.0, 0);
            cometMesh.add(label);
            labelObjects.push({ label: label, data: cometData, div: div });
        }
    }

    // ===== 聚焦环（已移除，改用标签高亮代替）=====

    // 标签可见状态
    SPACEDEMO.labelsVisible = true;
    SPACEDEMO.focusedPlanet = null;
    SPACEDEMO.focusAnim = null;
    SPACEDEMO.isFullscreen = false;
    SPACEDEMO.targetZoomDist = null;
    SPACEDEMO.mapModeActive = false;
}
