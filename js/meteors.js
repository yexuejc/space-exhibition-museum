// ===== 太空探索博物馆 - 流星雨系统 =====
// 夜空随机出现流星，发光头部+渐变拖尾

var MAX_METEORS = 5;
var meteorList = [];
var meteorTimer = 0;
var meteorInterval = 0;

function initMeteors() {
    meteorList = [];
    meteorTimer = 0;
    meteorInterval = 2 + Math.random() * 3; // 首次流星间隔
}

function spawnMeteor() {
    // 查找空位或覆盖最旧的
    var slot = null;
    for (var i = 0; i < MAX_METEORS; i++) {
        if (!meteorList[i] || !meteorList[i].active) {
            slot = i;
            break;
        }
    }
    if (slot === null) {
        // 覆盖最旧的
        var oldest = 0;
        for (var i = 1; i < MAX_METEORS; i++) {
            if (meteorList[i].startTime < meteorList[oldest].startTime) oldest = i;
        }
        slot = oldest;
    }

    // 流星起始位置（在场景外围大球上随机）
    var theta = Math.random() * Math.PI * 2; // 水平角
    var phi = Math.random() * Math.PI * 0.3 + 0.1; // 垂直角（偏上部分天空）
    var radius = 180 + Math.random() * 40;

    var startPos = new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi) * radius,
        Math.cos(phi) * radius,
        Math.sin(theta) * Math.sin(phi) * radius
    );

    // 方向（朝下偏水平，随机）
    var dir = new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        -(Math.random() * 0.3 + 0.2),
        (Math.random() - 0.5) * 0.8
    ).normalize();

    // 速度
    var speed = 80 + Math.random() * 60;
    // 生命周期（秒）
    var lifetime = 0.5 + Math.random() * 0.6;
    // 尾巴段数
    var segments = 12 + Math.floor(Math.random() * 8);

    // 创建流星线条几何体
    var positions = new Float32Array(segments * 3);
    var colors = new Float32Array(segments * 3);

    var geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    var mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1,
        linewidth: 1
    });

    var line = new THREE.Line(geom, mat);
    SPACEDEMO.scene.add(line);

    meteorList[slot] = {
        active: true,
        line: line,
        geom: geom,
        mat: mat,
        startPos: startPos,
        dir: dir,
        speed: speed,
        lifetime: lifetime,
        segments: segments,
        startTime: performance.now(),
        elapsed: 0
    };
}

function updateMeteors(deltaTime) {
    // 生成新流星
    meteorTimer += deltaTime;
    if (meteorTimer >= meteorInterval) {
        meteorTimer = 0;
        meteorInterval = 1 + Math.random() * 4;
        // 随机概率生成（不是每次必出，增加变化）
        if (Math.random() < 0.6) {
            spawnMeteor();
        }
    }

    // 更新已有流星
    var now = performance.now();
    for (var i = 0; i < meteorList.length; i++) {
        var m = meteorList[i];
        if (!m || !m.active) continue;

        m.elapsed = (now - m.startTime) / 1000;
        var progress = m.elapsed / m.lifetime;

        if (progress >= 1) {
            // 流星消失
            m.active = false;
            SPACEDEMO.scene.remove(m.line);
            m.line.geometry.dispose();
            m.line.material.dispose();
            continue;
        }

        // 位置：起始点 + 方向 * 速度 * 时间
        var currentPos = m.startPos.clone().add(
            m.dir.clone().multiplyScalar(m.speed * m.elapsed)
        );

        // 更新线条顶点
        var posAttr = m.geom.attributes.position;
        var colAttr = m.geom.attributes.color;
        var segCount = m.segments;

        // 头部亮度
        var headBrightness = 1 - progress;
        headBrightness = Math.max(0, headBrightness);

        for (var j = 0; j < segCount; j++) {
            var t = j / (segCount - 1);
            // 尾部位置：从当前位置后退
            var backDist = t * 8 * (1 + progress * 2); // 尾巴长度随时间略增
            var pos = currentPos.clone().add(
                m.dir.clone().multiplyScalar(-backDist)
            );
            posAttr.setXYZ(j, pos.x, pos.y, pos.z);

            // 颜色：头部亮白 → 尾部透明蓝
            var fade = Math.pow(1 - t, 2) * headBrightness;
            if (j === 0) {
                // 头部最亮
                colAttr.setXYZ(j, 1.0, 1.0, 1.0);
            } else {
                // 尾端渐变：白→蓝→透明
                var blue = 0.6 + 0.4 * (1 - t);
                var green = 0.7 + 0.3 * (1 - t);
                colAttr.setXYZ(j,
                    1.0 * fade,
                    green * fade,
                    blue * fade
                );
            }
        }

        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;

        // 整体透明度随生命周期淡出
        m.mat.opacity = Math.min(1, (1 - progress) * 1.5);
    }
}

// 清理所有流星（场景切换时调用）
function clearMeteors() {
    for (var i = 0; i < meteorList.length; i++) {
        var m = meteorList[i];
        if (m && m.active) {
            SPACEDEMO.scene.remove(m.line);
            m.line.geometry.dispose();
            m.line.material.dispose();
        }
    }
    meteorList = [];
}
