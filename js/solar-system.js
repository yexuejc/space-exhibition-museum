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

    // ===== 星空背景（Three.js 粒子）=====
    var starCount = 3000;
    var starGeom = new THREE.BufferGeometry();
    var starPos = new Float32Array(starCount * 3);
    var starSizes = new Float32Array(starCount);
    for (var i = 0; i < starCount; i++) {
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.acos(2 * Math.random() - 1);
        var r = 500 + Math.random() * 500;
        starPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i*3+2] = r * Math.cos(phi);
        starSizes[i] = Math.random() * 2 + 0.5;
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeom.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    var starMat = new THREE.PointsMaterial({
        color: 0xffffff, size: 0.8, transparent: true, opacity: 0.8,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    var starField = new THREE.Points(starGeom, starMat);
    scene.add(starField);

    // ===== 太阳 =====
    var sun = new THREE.Mesh(
        new THREE.SphereGeometry(SUN_RADIUS, 48, 48),
        new THREE.MeshBasicMaterial({ map: createSunProcedural() })
    );
    scene.add(sun);
    SPACEDEMO.sun = sun;

    // 太阳光晕
    var glow = new THREE.Mesh(
        new THREE.SphereGeometry(SUN_RADIUS * 1.16, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.12, side: THREE.BackSide })
    );
    scene.add(glow);
    SPACEDEMO.glow = glow;

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

    // ===== 轨道环 =====
    planetData.forEach(function(p) {
        var ringGeo = new THREE.RingGeometry(p.dist - 0.05, p.dist + 0.05, 64);
        var ringMat = new THREE.MeshBasicMaterial({
            color: 0x4488aa, side: THREE.DoubleSide, transparent: true, opacity: 0.2
        });
        var ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        scene.add(ring);
    });

    // ===== 聚焦环 =====
    var focusRingGeo = new THREE.RingGeometry(0.6, 0.8, 32);
    var focusRingMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.6
    });
    var focusRing = new THREE.Mesh(focusRingGeo, focusRingMat);
    focusRing.rotation.x = -Math.PI / 2;
    focusRing.visible = false;
    scene.add(focusRing);
    SPACEDEMO.focusRing = focusRing;

    // 标签可见状态
    SPACEDEMO.labelsVisible = true;
    SPACEDEMO.focusedPlanet = null;
    SPACEDEMO.focusAnim = null;
    SPACEDEMO.isFullscreen = false;
    SPACEDEMO.targetZoomDist = null;
    SPACEDEMO.mapModeActive = false;
}
