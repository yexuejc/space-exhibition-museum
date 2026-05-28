// ===== 太空探索博物馆 - 星座系统 =====
// 定义知名星座的恒星位置、连线、神话故事
// 单击星座区域 → 显示轮廓 + 神话故事

// 星座数据：坐标在 3D 场景中的世界位置（相机默认看向方向）
var constellationData = [{
    name: '北斗七星',
    en: 'Big Dipper',
    myth: '北斗七星是中华文化中最重要的星象之一，由天枢、天璇、天玑、天权、玉衡、开阳、瑶光七星组成。' +
          '古人云："北斗在天，辨方正位"，用北斗七星可以确定方向、判断季节。' +
          '天璇与天枢的连线延长5倍，就是北极星的位置。',
    center: { x: 80, y: 120, z: -280 },
    stars: [
        { x:0, y:0, z:0, label:'天枢' },
        { x:-18, y:-12, z:3, label:'天璇' },
        { x:-30, y:-30, z:5, label:'天玑' },
        { x:-34, y:-50, z:6, label:'天权' },
        { x:-15, y:-65, z:8, label:'玉衡' },
        { x:5, y:-75, z:7, label:'开阳' },
        { x:25, y:-85, z:10, label:'瑶光' }
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]]
},{
    name: '猎户座',
    en: 'Orion',
    myth: '猎户座是夜空中最壮丽的星座之一。在中国古代被视为"参宿"。' +
          '传说中猎户是希腊神话中的巨人猎人，腰间三颗星就是他的腰带。' +
          '参宿四和参宿七分别是红色的超巨星和蓝白色的超巨星，极为醒目。',
    center: { x: -150, y: 80, z: -260 },
    stars: [
        { x:0, y:40, z:0, label:'参宿四(α)' },
        { x:-20, y:20, z:5, label:'参宿五(γ)' },
        { x:15, y:18, z:-3, label:'参宿六(κ)' },
        { x:-8, y:5, z:2, label:'参宿一(ζ,腰带)' },
        { x:2, y:0, z:0, label:'参宿二(ε,腰带)' },
        { x:12, y:-5, z:-2, label:'参宿三(δ,腰带)' },
        { x:-25, y:-15, z:4, label:'参宿七(β)' },
        { x:20, y:-25, z:-4, label:'参宿八(ι)' }
    ],
    lines: [[0,1],[0,2],[1,3],[3,4],[4,5],[2,5],[3,6],[4,6],[5,7],[6,7]]
},{
    name: '仙后座',
    en: 'Cassiopeia',
    myth: '仙后座以W形状闻名，是希腊神话中埃塞俄比亚的王后卡西奥佩娅。' +
          '她因夸耀自己的女儿安德洛墨达比海神女儿更美而触怒海神，' +
          '最终被罚坐在宝座上绕北极旋转，每年有半年头朝下倒悬。' +
          '仙后座在导航中也很重要，与北斗七星相对，用于寻找北极星。',
    center: { x: 180, y: 130, z: -250 },
    stars: [
        { x:0, y:0, z:0, label:'王良一(β)' },
        { x:20, y:-15, z:3, label:'王良二(α)' },
        { x:35, y:-35, z:2, label:'王良三(η)' },
        { x:10, y:-40, z:-2, label:'策(γ)' },
        { x:-15, y:-30, z:2, label:'王良四(δ)' }
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,0]]
},{
    name: '天鹅座',
    en: 'Cygnus',
    myth: '天鹅座在夏夜星空中最为醒目，形状像一只展翅飞翔的天鹅。' +
          '在中国古代传说中，织女星与牛郎星分居银河两岸，' +
          '而天鹅座的天津四正是"银河渡口"上的重要航标。' +
          '天鹅座的主星天津四是一颗蓝白色的超巨星，与牛郎星、织女星构成夏季大三角。',
    center: { x: -60, y: 160, z: -280 },
    stars: [
        { x:0, y:25, z:0, label:'天津四(α)' },
        { x:-25, y:0, z:5, label:'辇道增七(β)' },
        { x:20, y:5, z:-5, label:'天津一(γ)' },
        { x:-5, y:-10, z:2, label:'天津二(δ)' },
        { x:5, y:-15, z:-2, label:'天津三(ε)' },
        { x:-15, y:-30, z:5, label:'天津八(ζ)' },
        { x:10, y:-35, z:-5, label:'天津九(η)' }
    ],
    lines: [[0,1],[0,2],[1,3],[3,4],[4,5],[4,6],[1,4]]
}];

var constellationLines = [];
var constellationClickables = [];

// 场景中放置星座星点并绘制连线
function createConstellations() {
    var scene = SPACEDEMO.scene;

    constellationData.forEach(function(c, ci) {
        // 创建该星座的星星（较亮的星点）
        var starGroup = new THREE.Group();
        var starPositions = [];
        var starLabels = [];

        c.stars.forEach(function(s, si) {
            // 星点位置（相对于星座中心偏移）
            var x = c.center.x + s.x;
            var y = c.center.y + s.y;
            var z = c.center.z + s.z;
            starPositions.push(new THREE.Vector3(x, y, z));

            // 创建发光星点（比背景星星大、亮）
            var spriteMap = createStarSprite();
            var sprite = new THREE.Sprite(
                new THREE.SpriteMaterial({
                    map: spriteMap,
                    color: 0xaaccff,
                    blending: THREE.AdditiveBlending,
                    depthTest: true
                })
            );
            sprite.position.set(x, y, z);
            sprite.scale.set(2.5, 2.5, 1);
            sprite.userData.constellationIdx = ci;
            sprite.userData.starIdx = si;
            scene.add(sprite);
            starGroup.add(sprite);

            // 星名标签（CSS2D）
            if (SPACEDEMO.labelRenderer && typeof THREE.CSS2DObject !== 'undefined') {
                var div = document.createElement('div');
                div.className = 'star-label';
                div.textContent = s.label;
                div.style.cssText = 'color:rgba(200,220,255,0.6);font-size:10px;' +
                    'text-shadow:0 0 4px rgba(0,150,255,0.5);pointer-events:none;' +
                    'transition:opacity 0.3s;';
                var label = new THREE.CSS2DObject(div);
                label.position.set(x, y - 2.5, z);
                scene.add(label);
                starLabels.push(label);
            }
        });

        // 绘制星座连线
        c.lines.forEach(function(line) {
            var p1 = starPositions[line[0]];
            var p2 = starPositions[line[1]];
            if (!p1 || !p2) return;

            var points = [p1.clone(), p2.clone()];
            var geometry = new THREE.BufferGeometry().setFromPoints(points);
            var material = new THREE.LineBasicMaterial({
                color: 0x4488cc,
                transparent: true,
                opacity: 0.35,
                linewidth: 1
            });
            var lineObj = new THREE.Line(geometry, material);
            scene.add(lineObj);
            constellationLines.push(lineObj);
        });

        // 星座区域点击检测（不可见大球）
        var clickRadius = 40;
        var clickSphere = new THREE.Mesh(
            new THREE.SphereGeometry(clickRadius, 16, 16),
            new THREE.MeshBasicMaterial({
                visible: false,
                transparent: true,
                opacity: 0
            })
        );
        clickSphere.position.set(c.center.x, c.center.y, c.center.z);
        clickSphere.userData.isConstellation = true;
        clickSphere.userData.constellationIdx = ci;
        scene.add(clickSphere);
        constellationClickables.push(clickSphere);
        // 加到 clickables 以便点击检测
        SPACEDEMO.clickables.push(clickSphere);
    });
}

// 创建星点精灵纹理
function createStarSprite() {
    var canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    var ctx = canvas.getContext('2d');
    var grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.15, 'rgba(200,220,255,0.8)');
    grad.addColorStop(0.5, 'rgba(100,150,255,0.3)');
    grad.addColorStop(1, 'rgba(100,150,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
}

// 星座信息弹窗
var constellationCard = null;

function showConstellationInfo(ci) {
    var c = constellationData[ci];
    if (!c) return;

    // 高亮星座连线
    constellationLines.forEach(function(line) {
        line.material.opacity = 0.15;
    });
    var startIdx = 0;
    for (var i = 0; i < ci; i++) {
        startIdx += constellationData[i].lines.length;
    }
    for (var i = startIdx; i < startIdx + c.lines.length; i++) {
        if (constellationLines[i]) {
            constellationLines[i].material.opacity = 0.8;
            constellationLines[i].material.color.setHex(0x66ddff);
        }
    }

    // 创建或更新信息卡片
    if (!constellationCard) {
        constellationCard = document.createElement('div');
        constellationCard.id = 'constellationCard';
        constellationCard.style.cssText = 'position:fixed;bottom:-400px;left:50%;transform:translateX(-50%);' +
            'background:rgba(0,10,30,0.94);border:1px solid rgba(100,200,255,0.3);border-radius:16px;' +
            'padding:20px 28px;z-index:2100;transition:bottom 0.5s cubic-bezier(0.34,1.56,0.64,1);' +
            'backdrop-filter:blur(12px);max-width:480px;width:90%;' +
            'box-shadow:0 8px 40px rgba(0,0,0,0.6);';
        constellationCard.innerHTML =
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
            '<span id="cCardIcon" style="font-size:28px;">🌟</span>' +
            '<h3 id="cCardTitle" style="margin:0;color:#66ddff;font-size:18px;"></h3>' +
            '<span id="cCardEn" style="margin:0;color:#556677;font-size:13px;"></span>' +
            '</div>' +
            '<p id="cCardMyth" style="margin:8px 0 0;color:#99aabb;font-size:14px;line-height:1.7;"></p>' +
            '<span style="position:absolute;top:8px;right:12px;color:#445566;cursor:pointer;font-size:16px;" onclick="hideConstellationCard()">✕</span>';
        document.body.appendChild(constellationCard);
        window.hideConstellationCard = function() {
            constellationCard.style.bottom = '-400px';
            // 恢复连线透明度
            constellationLines.forEach(function(line) {
                line.material.opacity = 0.35;
                line.material.color.setHex(0x4488cc);
            });
        };
    }

    document.getElementById('cCardIcon').textContent = '🌟';
    document.getElementById('cCardTitle').textContent = c.name;
    document.getElementById('cCardEn').textContent = c.en;
    document.getElementById('cCardMyth').textContent = c.myth;
    constellationCard.style.bottom = '20px';

    // 如有语音，朗读星座故事
    if (typeof speechEnabled !== 'undefined' && speechEnabled && window.speechSynthesis) {
        var text = c.name + '。' + c.myth;
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }
}

// 交互事件绑定（单击检测星座，复用 ui.js 的 raycaster）
function setupConstellationClick(mouse, raycaster) {
    // 这个函数被 setupInteractionEvents 调用
    // 检查是否点击到星座
    var intersects = raycaster.intersectObjects(constellationClickables);
    if (intersects.length > 0) {
        var hit = intersects[0].object;
        if (hit.userData.isConstellation) {
            showConstellationInfo(hit.userData.constellationIdx);
            return true;
        }
    }
    return false;
}
