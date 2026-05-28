// ===== 太空探索博物馆 - 行星语音解说 =====
// 使用 Web Speech API，无需外部依赖

var speechEnabled = true;
var currentUtterance = null;

// 行星中文解说文本
var planetSpeech = {
    '水星': '水星，太阳系最小行星，也是最靠近太阳的行星。它的表面布满了陨石坑，温差极大，白天可达430度，夜间则骤降至零下180度。',
    '金星': '金星，太阳系中最热的行星，表面温度高达460度。它的自转方向与大多数行星相反，被称为启明星和长庚星，是夜空中最亮的行星。',
    '地球': '地球，我们的家园，太阳系中唯一已知存在生命的行星。它拥有液态水和适宜的大气层，表面百分之71被海洋覆盖。从太空看，它是一颗美丽的蓝色星球。',
    '火星': '火星，被称为红色星球，拥有太阳系最高的山峰，奥林匹斯山。科学家们正在探索火星上是否存在过生命的痕迹，它是人类太空探索的重要目标。',
    '木星': '木星，太阳系最大的行星，质量是其他所有行星总和的2.5倍。它的大红斑风暴已经持续了数百年，比地球还要大。',
    '土星': '土星，以壮观的环系统而闻名，密度低于水。它拥有82颗已知卫星，是太阳系中卫星最多的行星之一。',
    '天王星': '天王星，一颗冰巨星，自转轴几乎与轨道平行，像是躺着旋转。它呈现独特的蓝绿色，大气中含有甲烷。',
    '海王星': '海王星，太阳系最远的行星，风速可达每小时2100公里，是太阳系中风速最快的行星。它是一颗深蓝色的冰巨星。'
};

// 语音解说文本（更完整版用于扩展）
function getPlanetSpeechText(p) {
    var base = planetSpeech[p.name] || (p.name + '是太阳系中的一颗行星。');
    // 加上公转周期信息
    return base + ' 它的公转周期是' + p.orbitalPeriod.toFixed(2) + '年。';
}

// 朗读行星信息
function speakPlanet(planetData) {
    if (!speechEnabled || !window.speechSynthesis) return;

    // 停止当前朗读
    if (currentUtterance) {
        window.speechSynthesis.cancel();
    }

    var text = getPlanetSpeechText(planetData);
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.88;  // 稍慢清晰
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    utterance.onstart = function() {
        currentUtterance = utterance;
    };
    utterance.onend = function() {
        currentUtterance = null;
    };
    utterance.onerror = function() {
        currentUtterance = null;
    };

    window.speechSynthesis.speak(utterance);
}

// 停止语音
function stopSpeech() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    currentUtterance = null;
}

// ===== 语音控制按钮 =====
function setupSpeechControl() {
    var btn = document.createElement('button');
    btn.id = 'speechToggle';
    btn.innerHTML = '🔊';
    btn.title = '单击卡片时语音解说';
    btn.style.cssText = 'position:fixed;top:150px;right:20px;z-index:1500;' +
        'background:rgba(0,20,40,0.7);border:1px solid rgba(0,200,255,0.3);color:#00ddff;' +
        'padding:8px 12px;border-radius:8px;cursor:pointer;font-size:16px;' +
        'backdrop-filter:blur(6px);transition:all 0.3s;';

    btn.onclick = function() {
        speechEnabled = !speechEnabled;
        if (!speechEnabled) {
            stopSpeech();
            btn.innerHTML = '🔇';
            btn.style.color = '#ff6644';
            btn.style.borderColor = 'rgba(255,100,0,0.5)';
        } else {
            btn.innerHTML = '🔊';
            btn.style.color = '#00ddff';
            btn.style.borderColor = 'rgba(0,200,255,0.3)';
        }
    };

    document.body.appendChild(btn);

    // 页面离开时停止语音
    window.addEventListener('beforeunload', function() {
        stopSpeech();
    });
}
