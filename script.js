// ===== 粒子星空背景 =====
function initParticles() {
    tsParticles.load("particles-js", {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: { min: 1, max: 4 }, random: true },
            line_linked: {
                enable: true, distance: 150, color: "#ffffff",
                opacity: 0.2, width: 1
            },
            move: {
                enable: true, speed: 0.5, direction: "none",
                random: true, out_mode: "out"
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "bubble" },
                onclick: { enable: true, mode: "push" }
            },
            modes: {
                bubble: { distance: 200, size: 6, duration: 2, opacity: 0.8 },
                push: { particles_nb: 3 }
            }
        },
        retina_detect: true
    });
}

// ===== 行星数据 =====
const planetData = [
    { name:'水星', icon:'☿', radius:0.38, dist:8,  color:0xaaaaaa,
      info:{ ch:'最小的行星，距太阳最近，表面温度极昼夜温差大（-180°C~430°C）。',
             en:'Smallest planet, closest to Sun, extreme temperature swings.' } },
    { name:'金星', icon:'♀', radius:0.95, dist:12, color:0xffaa00,
      info:{ ch:'最热的行星，大气浓厚含二氧化碳，表面温度可达465°C。',
             en:'Hottest planet, thick CO₂ atmosphere, surface up to 465°C.' } },
    { name:'地球', icon:'🌍', radius:1.0,  dist:16, color:0x4488ff,
      info:{ ch:'我们的家园，目前已知唯一拥有液态水和生命的星球。',
             en:'Our home, the only known planet with liquid water and life.' } },
    { name:'火星', icon:'♂',  radius:0.53, dist:20, color:0xcc4400,
      info:{ ch:'红色星球，拥有太阳系最高峰奥林匹斯山。已有多个探测器到达。',
             en:'Red Planet, home to Olympus Mons, the tallest mountain in solar system.' } },
    { name:'木星', icon:'♃', radius:11.2, dist:28, color:0xd4a574,
      info:{ ch:'太阳系最大行星，大红斑风暴已持续数百年。',
             en:'Largest planet, Great Red Spot storm has raged for centuries.' } },
    { name:'土星', icon:'♄', radius:9.45, dist:36, color:0xeeddbb,
      info:{ ch:'以壮观的环系统闻名，密度低于水，有82颗已知卫星。',
             en:'Famous for spectacular ring system, lower density than water.' } },
    { name:'天王星', icon:'♅', radius:4.0,  dist:44, color:0x44aaff,
      info:{ ch:'冰巨星，自转轴几乎与轨道平行，像"躺"着转。',
             en:'Ice giant, rotates on its side with extreme axial tilt.' } },
    { name:'海王星', icon:'♆', radius:3.88, dist:52, color:0x3344ee,
      info:{ ch:'太阳系最远行星，风速可达2100km/h，是太阳系风速最快的。',
             en:'Farthest planet, fastest winds in solar system up to 2,100 km/h.' } }
];

// ===== 程序化纹理生成（无需外部图片） =====
function createPlanetTexture(color, variant) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const r = (color >> 16) & 0xff, g = (color >> 8) & 0xff, b = color & 0xff;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * 256, y = Math.random() * 128;
        const size = Math.random() * 20 + 3;
        const alpha = Math.random() * 0.3;
        const shade = variant === 'light' ? 40 : -40;
        ctx.fillStyle = `rgba(${r+shade*Math.random()},${g+shade*Math.random()},${b+shade*Math.random()},${alpha})`;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }
    if (variant === 'banded') {
        for (let i = 0; i < 12; i++) {
            const y = Math.random() * 128, h = Math.random() * 8 + 2;
            ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.2+0.1})`;
            ctx.fillRect(0, y, 256, h);
        }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

function createSunTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(256, 128, 0, 256, 128, 256);
    grad.addColorStop(0, '#fffbe6'); grad.addColorStop(0.3, '#ffdd44');
    grad.addColorStop(0.6, '#ff8800'); grad.addColorStop(0.8, '#cc4400');
    grad.addColorStop(1, '#661100');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(255,200,50,${Math.random()*0.2+0.05})`;
        ctx.beginPath();
        ctx.arc(Math.random()*512, Math.random()*256, Math.random()*30+5, 0, Math.PI*2);
        ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
}

// ===== 行星信息卡片 =====
const card = document.getElementById('planetCard');
if (card) {
    const cardTitle = document.getElementById('cardTitle');
    const cardContent = document.getElementById('cardContent');
    const cardClose = document.getElementById('cardClose');
    const cardIcon = document.getElementById('cardIcon');

    window.showPlanetCard = function(p) {
        cardTitle.textContent = p.name;
        cardIcon.textContent = p.icon || '🪐';
        cardContent.innerHTML = `
            <p><span class="label">距太阳：</span>${p.dist * 5} 百万公里</p>
            <p><span class="label">大小：</span>${p.radius < 1 ? '小型' : p.radius < 5 ? '中型' : '巨型'}</p>
            <p><span class="label">描述：</span>${p.info.ch}</p>
            <p style="color:#888;font-size:0.85rem;margin-top:0.8rem;border-left:none;padding-left:0;">
                <em>${p.info.en}</em>
            </p>
        `;
        card.classList.add('show');
    };
    window.hidePlanetCard = function() { card.classList.remove('show'); };
    if (cardClose) cardClose.addEventListener('click', window.hidePlanetCard);
}

// ===== VR 360° 太阳系 =====
function initVR() {
    const container = document.getElementById('vrContainer');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth/container.clientHeight, 0.1, 1000);
    camera.position.set(0, 25, 55);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.xr.enabled = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // VR 按钮
    try { document.body.appendChild(VRButton.createButton(renderer)); }
    catch(e) { console.log('VR button not available'); }

    // 光照
    scene.add(new THREE.AmbientLight(0x404060, 0.4));
    const sunLight = new THREE.PointLight(0xffffff, 2, 500);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // 远处星空
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        const r = 150 + Math.random() * 200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i*3+1] = r * Math.cos(phi);
        pos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const starMat = new THREE.PointsMaterial({
        size: 1.2, color: 0xffffff, transparent: true, opacity: 0.8,
        blending: THREE.AdditiveBlending, sizeAttenuation: true
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 太阳
    const sun = new THREE.Mesh(
        new THREE.SphereGeometry(5, 64, 64),
        new THREE.MeshBasicMaterial({ map: createSunTexture() })
    );
    scene.add(sun);

    // 太阳光晕
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(5.8, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.12, side: THREE.BackSide })
    );
    scene.add(glow);

    // 创建行星
    const planets = planetData.map(p => {
        const tex = createPlanetTexture(p.color, (p.name==='木星'||p.name==='土星') ? 'banded' : 'light');
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(p.radius, 32, 32),
            new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, metalness: 0.1 })
        );
        const angle = Math.random() * Math.PI * 2;
        mesh.position.set(Math.cos(angle)*p.dist, 0, Math.sin(angle)*p.dist);
        scene.add(mesh);
        return { mesh, angle, ...p };
    });

    // 轨道环
    planets.forEach(p => {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(p.dist-0.05, p.dist+0.05, 64),
            new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.12 })
        );
        ring.rotation.x = -Math.PI / 2;
        scene.add(ring);
    });

    // 控制器
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 180;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    // 点击交互（射线检测）
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const clickables = planets.map(p => p.mesh);

    renderer.domElement.addEventListener('click', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(clickables);
        if (hits.length > 0) {
            const hit = planets.find(p => p.mesh === hits[0].object);
            if (hit && window.showPlanetCard) window.showPlanetCard(hit);
        } else {
            if (window.hidePlanetCard) window.hidePlanetCard();
        }
    });

    // 动画
    function animate() {
        sun.rotation.y += 0.001;
        glow.rotation.y += 0.0005;
        planets.forEach(p => {
            p.angle += 0.002 + (0.006 / (p.dist/5));
            p.mesh.position.x = Math.cos(p.angle) * p.dist;
            p.mesh.position.z = Math.sin(p.angle) * p.dist;
            p.mesh.rotation.y += 0.005;
        });
        starField.rotation.y += 0.0001;
        controls.update();
        renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);

    // 自适应
    const ro = new ResizeObserver(() => {
        const w = container.clientWidth, h = container.clientHeight;
        if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
    });
    ro.observe(container);
}

// ===== 启动 =====
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initVR();
});
