// 初始化粒子背景（保持原有星空）
function initParticles(){
    tsParticles.load("particles-js", {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.5 },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, out_mode: "out" }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" },
                resize: true
            },
            modes: { repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 } }
        },
        retina_detect: true
    });
}

// ---------- VR 360° 太阳系 ----------
function initVR(){
    const container = document.getElementById('vrContainer');
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 20, 40);

    // Renderer with XR support
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.xr.enabled = true; // 开启 XR
    container.appendChild(renderer.domElement);

    // VR Button (Three.js 内置) – 会自动添加到页面底部
    document.body.appendChild(VRButton.createButton(renderer));

    // 环境光 + 点光源（模拟太阳）
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const sunLight = new THREE.PointLight(0xffffff, 1.5, 500);
    sunLight.position.set(0,0,0);
    scene.add(sunLight);

    // 纹理加载器（后续可替换为真实 NASA 纹理）
    const texLoader = new THREE.TextureLoader();
    const placeholder = 'https://i.imgur.com/8bB7tGZ.jpg'; // 太阳占位

    // 太阳
    const sunGeo = new THREE.SphereGeometry(5, 64, 64);
    const sunMat = new THREE.MeshBasicMaterial({ map: texLoader.load(placeholder) });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    // 行星数据（比例化简，以适配 VR 视野）
    const planetDefs = [
        {name:'水星', radius:0.38, dist:8,  tex:'https://i.imgur.com/xyz1.jpg'},
        {name:'金星', radius:0.95, dist:12, tex:'https://i.imgur.com/xyz2.jpg'},
        {name:'地球', radius:1,    dist:16, tex:'https://i.imgur.com/xyz3.jpg'},
        {name:'火星', radius:0.53, dist:20, tex:'https://i.imgur.com/xyz4.jpg'},
        {name:'木星', radius:11.2, dist:28, tex:'https://i.imgur.com/xyz5.jpg'},
        {name:'土星', radius:9.45, dist:36, tex:'https://i.imgur.com/xyz6.jpg'},
        {name:'天王星', radius:4,  dist:44, tex:'https://i.imgur.com/xyz7.jpg'},
        {name:'海王星', radius:3.88,dist:52, tex:'https://i.imgur.com/xyz8.jpg'}
    ];

    const planets = planetDefs.map(p=>{
        const geo = new THREE.SphereGeometry(p.radius, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ map: texLoader.load(p.tex) });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(p.dist, 0, 0);
        scene.add(mesh);
        return {mesh, ...p, angle: Math.random()*Math.PI*2 };
    });

    // 控制器（OrbitControls 也可以在 VR 中使用）
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 5;
    controls.maxDistance = 200;

    // 动画循环（自转 + 公转）
    function animate(){
        renderer.setAnimationLoop(render);
    }
    function render(){
        planets.forEach(p=>{
            // 公转
            p.angle += 0.001;
            p.mesh.position.set(Math.cos(p.angle)*p.dist, 0, Math.sin(p.angle)*p.dist);
            // 自转
            p.mesh.rotation.y += 0.004;
        });
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // 自适应窗口大小
    window.addEventListener('resize', ()=>{
        const w = container.clientWidth, h = container.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w/h;
        camera.updateProjectionMatrix();
    });
}

// 页面加载完毕后启动
document.addEventListener('DOMContentLoaded',()=>{
    initParticles();
    initVR();
});
