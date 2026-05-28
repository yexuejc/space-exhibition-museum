// ===== 太空探索博物馆 - 界面交互模块 =====
// 行星信息卡片、标签切换、全屏沉浸、聚焦动画、缩放滑块、时间控制

// ===== 音频解说 =====
var speechSynth = window.speechSynthesis;
var speechUtterance = null;
var speechQueue = [];    // 待播放文本队列
var isSpeaking = false;
var currentSpeechPlanet = '';

// 行星解说文本（中英双语）
var planetNarration = {
    '水星': {
        zh: '水星是太阳系中最小且离太阳最近的行星。表面布满陨石坑，酷似月球。白天温度高达430度，夜晚骤降到零下180度。水星没有大气层保护，是太阳系中最极端的环境之一。公转周期仅88天，是八大行星中速度最快的。',
        en: 'Mercury is the smallest and closest planet to the Sun. Its cratered surface resembles our Moon. Daytime temperatures soar to 430 degrees Celsius, while nights plunge to minus 180 degrees. With no atmosphere, Mercury is one of the most extreme environments in our solar system.'
    },
    '金星': {
        zh: '金星是太阳系中最热的行星，表面温度高达470度。浓厚的二氧化碳大气层产生了强烈的温室效应。金星自转方向与其他行星相反，是太阳系中最慢的自转，一天比一年还长。古代中国人称它为启明星或长庚星。',
        en: 'Venus is the hottest planet in our solar system, with surface temperatures reaching 470 degrees Celsius. Its thick carbon dioxide atmosphere creates a runaway greenhouse effect. Venus rotates backwards and has the slowest rotation of any planet.'
    },
    '地球': {
        zh: '地球是太阳系中唯一已知存在生命的行星。液态水覆盖了约百分之七十一的表面，大气中含有丰富的氮气和氧气。地球有一个巨大的月球作为卫星，潮汐力稳定了地轴倾角，创造了稳定的气候。请在欣赏太空美景的同时，珍惜我们唯一的家园。',
        en: 'Earth is the only planet known to harbor life. Liquid water covers about 71 percent of its surface. Its atmosphere is rich in nitrogen and oxygen. Earth\'s large Moon stabilizes its axial tilt, creating a stable climate for life to flourish.'
    },
    '火星': {
        zh: '火星被称为红色星球，表面富含氧化铁。它拥有太阳系中最高大的山峰——奥林匹斯山，高达21.9公里，以及最大的峡谷——水手号峡谷。科学家们正在积极探索火星上是否存在过生命。人类计划在本世纪内登陆火星。',
        en: 'Mars, known as the Red Planet, is rich in iron oxide on its surface. It boasts Olympus Mons, the tallest mountain in the solar system at 21.9 kilometers, and Valles Marineris, the largest canyon. Scientists are actively searching for signs of past life on Mars.'
    },
    '木星': {
        zh: '木星是太阳系中最大的行星，质量是其他所有行星总和的2.5倍。大红斑是一个持续了数百年的巨型风暴，比地球还要大。木星拥有79颗已知卫星，其中木卫二欧罗巴被认为是寻找地外生命最有希望的地方之一。',
        en: 'Jupiter is the largest planet in our solar system, with a mass 2.5 times that of all other planets combined. The Great Red Spot is a giant storm that has raged for hundreds of years. Jupiter has 79 known moons, with Europa considered a promising candidate for extraterrestrial life.'
    },
    '土星': {
        zh: '土星以其壮观的环系统闻名于世。土星环主要由冰粒和岩石碎片组成，宽度约28万公里，厚度却只有几十米。土星的密度比水还小，如果有足够大的海洋，它将漂浮起来。土卫六泰坦是太阳系中唯一拥有浓厚大气层的卫星。',
        en: 'Saturn is famous for its spectacular ring system, made primarily of ice particles and rocky debris. The rings span about 280,000 kilometers but are only tens of meters thick. Saturn\'s density is less than water — it would float in a large enough ocean.'
    },
    '天王星': {
        zh: '天王星是一个侧躺着公转的冰巨星，自转轴几乎与轨道面平行，倾斜角达97.8度。它的蓝绿色来自大气中的甲烷。天王星是第一颗通过望远镜发现的行星，由威廉·赫歇尔在1781年发现。它有27颗已知卫星。',
        en: 'Uranus is an ice giant that rotates on its side, with an axial tilt of 97.8 degrees. Its blue-green color comes from methane in its atmosphere. Uranus was the first planet discovered with a telescope, found by William Herschel in 1781.'
    },
    '海王星': {
        zh: '海王星是太阳系中距太阳最远的行星，也是风速最快的行星，风速可达每小时2100公里。它鲜艳的蓝色来自大气中的甲烷。海王星是唯一通过数学计算而非直接观测被发现的行星。它的卫星海卫一正沿着螺旋轨道缓慢接近行星。',
        en: 'Neptune is the farthest planet from the Sun and has the fastest winds in the solar system, reaching 2,100 kilometers per hour. Its vivid blue color comes from methane. Neptune was the first planet discovered through mathematical prediction rather than direct observation.'
    },
    '冥王星': {
        zh: '冥王星曾经是第九大行星，2006年被重新分类为矮行星。它位于柯伊伯带，表面有标志性的心形区域——汤博区。冥王星有5颗卫星，其中最大的卡戎与冥王星组成了双矮行星系统。新视野号探测器于2015年首次飞掠冥王星。',
        en: 'Pluto was once the ninth planet but was reclassified as a dwarf planet in 2006. Located in the Kuiper Belt, it features a famous heart-shaped region called Tombaugh Regio. The New Horizons spacecraft made humanity\'s first flyby of Pluto in 2015.'
    },
    '谷神星': {
        zh: '谷神星是小行星带中最大的天体，也是唯一一颗位于小行星带的矮行星。它的直径约950公里，表面可能存在水冰。谷神星在1801年被发现，是首个被发现的小行星。黎明号探测器在2015年抵达谷神星。',
        en: 'Ceres is the largest object in the asteroid belt and the only dwarf planet located there. About 950 kilometers in diameter, its surface may contain water ice. Discovered in 1801, it was the first asteroid ever found.'
    },
    '阋神星': {
        zh: '阋神星是太阳系中质量最大的矮行星，比冥王星还要重约百分之二十七。它位于遥远的离散盘区域，公转周期约557年。阋神星的发现直接导致了冥王星被重新分类为矮行星。',
        en: 'Eris is the most massive dwarf planet in our solar system, about 27 percent more massive than Pluto. Located in the scattered disc region, its orbital period is about 557 years. Its discovery led directly to Pluto\'s reclassification as a dwarf planet.'
    },
    '月球': {
        zh: '月球是地球唯一的天然卫星，也是人类唯一步足踏上的地外天体。月球表面布满陨石坑，没有大气层和水。潮汐锁定使月球始终以同一面朝向地球。月球的引力潮汐影响着地球的海洋。',
        en: 'The Moon is Earth\'s only natural satellite and the only celestial body humans have set foot on. Its surface is covered with craters. Tidal locking keeps the same face toward Earth, and its gravity creates our ocean tides.'
    },
    '哈雷彗星': {
        zh: '哈雷彗星是最著名的周期性彗星，大约每75到76年回归一次。最近一次回归在1986年，下一次预计在2061年。彗星由冰、尘埃和岩石组成，靠近太阳时形成明亮的彗尾。爱德蒙·哈雷在1705年预言了它的回归。',
        en: 'Halley\'s Comet is the most famous periodic comet, returning every 75 to 76 years. Its last visit was in 1986, and it will return in 2061. Made of ice, dust, and rock, it forms a bright tail when approaching the Sun.'
    }
};

// 语音解说引擎
function toggleSpeech() {
    if (!window.speechSynthesis) return;
    if (isSpeaking && speechSynth.speaking) {
        if (speechSynth.paused) {
            resumeSpeech();
        } else {
            pauseSpeech();
        }
    } else if (window._lastCardData) {
        speakPlanet(window._lastCardData);
    }
}
function speakPlanet(planetData) {
    if (!window.speechSynthesis) return;
    var name = planetData.name || '';
    var narration = planetNarration[name];
    if (!narration) return;

    var text = currentLang === 'zh' ? narration.zh : narration.en;
    if (!text) text = narration.zh || narration.en || '';

    // 如果正在播同一行星则继续，不同则重新开始
    if (isSpeaking && currentSpeechPlanet === name) return;

    // 停止之前的语音
    if (speechSynth.speaking) {
        speechSynth.cancel();
    }

    currentSpeechPlanet = name;
    speechUtterance = new SpeechSynthesisUtterance(text);
    speechUtterance.lang = currentLang === 'zh' ? 'zh-CN' : 'en-US';
    speechUtterance.rate = 0.9;
    speechUtterance.pitch = 1.0;
    speechUtterance.volume = 0.8;

    isSpeaking = true;
    speechUtterance.onend = function() {
        isSpeaking = false;
        updateSpeechBtn('idle');
    };
    speechUtterance.onerror = function() {
        isSpeaking = false;
        updateSpeechBtn('idle');
    };

    speechSynth.speak(speechUtterance);
    updateSpeechBtn('playing');
    updateSpeechBar(name);
}

function pauseSpeech() {
    if (!window.speechSynthesis) return;
    if (speechSynth.speaking && !speechSynth.paused) {
        speechSynth.pause();
        updateSpeechBtn('paused');
    }
}

function resumeSpeech() {
    if (!window.speechSynthesis) return;
    if (speechSynth.paused) {
        speechSynth.resume();
        updateSpeechBtn('playing');
    }
}

function stopSpeech() {
    if (!window.speechSynthesis) return;
    if (speechSynth.speaking) {
        speechSynth.cancel();
    }
    isSpeaking = false;
    currentSpeechPlanet = '';
    updateSpeechBtn('idle');
}

function updateSpeechBtn(state) {
    var btn = document.getElementById('speechBtn');
    if (!btn) return;
    if (state === 'playing') {
        btn.textContent = '⏸';
        btn.style.color = '#00ddff';
    } else if (state === 'paused') {
        btn.textContent = '▶';
        btn.style.color = '#ff8800';
    } else {
        btn.textContent = '🔈';
        btn.style.color = '#667788';
    }
}

function updateSpeechBar(name) {
    var bar = document.getElementById('speechBar');
    if (!bar) return;
    var narration = planetNarration[name];
    if (!narration) return;
    var text = currentLang === 'zh' ? narration.zh : narration.en;
    if (!text) text = narration.zh;

    // 截取前50字
    var snippet = text.substring(0, 50) + (text.length > 50 ? '…' : '');
    bar.textContent = '🔊 ' + snippet;
}

// ===== i18n 多语言 =====
var currentLang = 'zh'; // 'zh' 或 'en'
var i18n = {
    zh: {
        tipBar: '🖱️ 单击行星查看信息 · 双击聚焦追踪 · 滚轮缩放 · 🗺️ 聚焦地球拉近进入地图',
        tipBarTour: '🎬 漫游已退出',
        tipBarTourActive: '🎬 漫游中：',
        pauseBtn: '⏸',
        playBtn: '▶',
        speed1x: '1×',
        fullscreenBtn: '⛶',
        labelToggle: '🏷️',
        tourBtn: '🎬',
        tourTitle: '自动漫游',
        mapBtn: '🗺️',
        mapTitle: '星空地图',
        dateTitle: '输入日期后按回车跳转',
        zoomLabel: '缩放',
        cardClose: '✕',
        cardDescEn: '—',
        sci: {  // 科学数据表头
            diameter: '直径',
            mass: '质量',
            gravity: '重力',
            density: '密度',
            temperature: '温度',
            atmosphere: '大气成分',
            moons: '卫星数量',
            auDist: '距太阳距离',
            orbitalPeriod: '公转周期',
            dayLength: '昼夜长度',
            yearLength: '年长度',
            axialTilt: '自转倾角',
            discoverer: '发现者',
            discoverYear: '发现年份',
            parent: '所属行星'
        },
        moonPhase: '🌙 当前月相：',
        phaseNames: ['🌑 新月','🌒 蛾眉月','🌓 上弦月','🌔 盈凸月','🌕 满月','🌖 亏凸月','🌗 下弦月','🌘 残月']
    },
    en: {
        tipBar: '🖱️ Click planet for info · Double-click to focus · Scroll to zoom · 🗺️ Focus Earth to enter map',
        tipBarTour: '🎬 Tour ended',
        tipBarTourActive: '🎬 Touring: ',
        pauseBtn: '⏸',
        playBtn: '▶',
        speed1x: '1×',
        fullscreenBtn: '⛶',
        labelToggle: '🏷️',
        tourBtn: '🎬',
        tourTitle: 'Auto Tour',
        mapBtn: '🗺️',
        mapTitle: 'Star Map',
        dateTitle: 'Press Enter to jump to date',
        zoomLabel: 'Zoom',
        cardClose: '✕',
        cardDescEn: '—',
        sci: {
            diameter: 'Diameter',
            mass: 'Mass',
            gravity: 'Gravity',
            density: 'Density',
            temperature: 'Temperature',
            atmosphere: 'Atmosphere',
            moons: 'Moons',
            auDist: 'Distance from Sun',
            orbitalPeriod: 'Orbital Period',
            dayLength: 'Day Length',
            yearLength: 'Year Length',
            axialTilt: 'Axial Tilt',
            discoverer: 'Discoverer',
            discoverYear: 'Discovery Year',
            parent: 'Parent Planet'
        },
        moonPhase: '🌙 Phase: ',
        phaseNames: ['🌑 New Moon','🌒 Waxing Crescent','🌓 First Quarter','🌔 Waxing Gibbous','🌕 Full Moon','🌖 Waning Gibbous','🌗 Last Quarter','🌘 Waning Crescent']
    }
};

// 获取 i18n 文本
function _(key) {
    var keys = key.split('.');
    var obj = i18n[currentLang];
    for (var i = 0; i < keys.length; i++) {
        if (obj && obj[keys[i]] !== undefined) obj = obj[keys[i]];
        else return key;
    }
    return obj;
}

// 更新所有 UI 文字
function updateUILanguage() {
    // 提示栏
    var tipBar = document.getElementById('tipBar');
    if (tipBar) {
        if (typeof tourActive !== 'undefined' && tourActive) {
            var stop = tourRoute[tourIndex];
            var name = stop && stop.data && stop.data.name ? stop.data.name : '—';
            var icon = stop && stop.data && stop.data.icon ? stop.data.icon : '🪐';
            tipBar.innerHTML = _('tipBarTourActive') + icon + ' ' + name;
        } else {
            tipBar.textContent = _('tipBar');
        }
    }
    // 日期输入框 title
    var dateInput = document.getElementById('dateJumpInput');
    if (dateInput) dateInput.title = _('dateTitle');
    // 全屏按钮 title
    var fsBtn = document.getElementById('fullscreenBtn');
    if (fsBtn) fsBtn.title = currentLang === 'zh' ? '全屏沉浸模式' : 'Fullscreen';
    // 标签按钮 title
    var ltBtn = document.getElementById('labelToggle');
    if (ltBtn) ltBtn.title = currentLang === 'zh' ? '切换名称标注' : 'Toggle Labels';
    // 漫游按钮 title
    var tb = document.getElementById('tourBtn');
    if (tb) tb.title = _('tourTitle');
}

// ===== 行星信息卡片（增强科学数据版）=====
(function initCard() {
    var card = document.createElement('div');
    card.id = 'planetCard';
    card.style.cssText = 'position:fixed;bottom:-500px;left:50%;transform:translateX(-50%);' +
        'background:rgba(0,8,25,0.95);border:1px solid rgba(0,200,255,0.25);border-radius:18px;' +
        'padding:0;z-index:2000;transition:bottom 0.5s cubic-bezier(0.34,1.56,0.64,1);' +
        'backdrop-filter:blur(16px);max-width:460px;width:92%;' +
        'box-shadow:0 8px 50px rgba(0,0,0,0.8),0 0 30px rgba(0,200,255,0.08);' +
        'overflow:hidden;max-height:80vh;overflow-y:auto;font-family:"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;';
    card.innerHTML =
        // 头部：图标+名称+关闭
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px 10px;border-bottom:1px solid rgba(0,200,255,0.1);">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
                '<span id="cardIcon" style="font-size:32px;width:40px;text-align:center;"></span>' +
                '<div>' +
                    '<h3 id="cardTitle" style="margin:0;color:#00ddff;font-size:18px;font-weight:600;"></h3>' +
                    '<span id="cardNameEn" style="color:#556677;font-size:11px;font-style:italic;"></span>' +
                '</div>' +
            '</div>' +
            '<span id="cardClose" style="color:#445566;cursor:pointer;font-size:18px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:all 0.2s;" ' +
            'onmouseover="this.style.background=\'rgba(255,255,255,0.1)\';this.style.color=\'#fff\'" ' +
            'onmouseout="this.style.background=\'transparent\';this.style.color=\'#445566\'" ' +
            'onclick="hidePlanetCard()">✕</span>' +
        '</div>' +
        // 简介
        '<div style="padding:10px 20px 6px;">' +
            '<p id="cardDesc" style="margin:0;color:#8899aa;font-size:13px;line-height:1.6;"></p>' +
        '</div>' +
        // 科学数据面板
        '<div id="cardSciData" style="padding:4px 20px 16px;"></div>' +
        // 语音控制条
        '<div style="display:flex;align-items:center;gap:8px;padding:6px 20px 12px;border-top:1px solid rgba(0,200,255,0.08);">' +
            '<span id="speechBtn" style="color:#667788;cursor:pointer;font-size:16px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:all 0.2s;" ' +
            'title="播放解说" ' +
            'onmouseover="this.style.background=\'rgba(0,200,255,0.1)\'" ' +
            'onmouseout="this.style.background=\'transparent\'" ' +
            'onclick="toggleSpeech()">🔈</span>' +
            '<span id="speechBar" style="flex:1;color:#556677;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;" ' +
            'title="点击播放/暂停解说" onclick="toggleSpeech()">🔊 点击播放解说</span>' +
        '</div>';
    document.body.appendChild(card);

    // 全局关闭函数
    if (typeof hidePlanetCard === 'undefined') {
        window.hidePlanetCard = function() {
            document.getElementById('planetCard').style.bottom = '-500px';
            // 关闭卡片时自动停止语音
            stopSpeech();
        };
    }

    // 显示信息卡片
    window.showPlanetCard = function(p) {
        var card = document.getElementById('planetCard');
        document.getElementById('cardIcon').textContent = p.icon || '🪐';
        document.getElementById('cardTitle').textContent = p.name;
        // 根据当前语言显示简介
        var desc = '';
        if (currentLang === 'zh' && p.info && p.info.ch) desc = p.info.ch;
        else if (currentLang === 'en' && p.info && p.info.en) desc = p.info.en;
        else if (p.info && p.info.ch) desc = p.info.ch;
        document.getElementById('cardDesc').textContent = desc;
        // 存储当前数据，用于语言切换刷新
        window._lastCardData = p;

        // 英文名
        var enEl = document.getElementById('cardNameEn');
        if (p.info && p.info.en) {
            enEl.textContent = p.info.en;
            enEl.style.display = '';
        } else {
            enEl.style.display = 'none';
        }

        // 构建科学数据面板
        var sciContainer = document.getElementById('cardSciData');
        sciContainer.innerHTML = buildSciTable(p);

        card.style.bottom = '20px';

        // 语音解说
        if (typeof speakPlanet === 'function') {
            speakPlanet(p);
        }
        // 更新语音条文本（语言切换时）
        var sb = document.getElementById('speechBar');
        if (sb && planetNarration[p.name]) {
            var nt = currentLang === 'zh' ? planetNarration[p.name].zh : planetNarration[p.name].en;
            if (nt) sb.textContent = '🔊 ' + nt.substring(0, 50) + (nt.length > 50 ? '…' : '');
        }
    };

    // 构建科学数据表格HTML
    function buildSciTable(p) {
        var sci = p.sci;
        if (!sci) return '<div style="color:#556677;font-size:12px;text-align:center;padding:8px;">' + (currentLang === 'zh' ? '暂无详细数据' : 'No data available') + '</div>';

        // i18n 翻译辅助
        function sciLabel(key) { return _('sci.' + key) || key; }

        var html = '';
        var categories = [
            {
                label: '📏 ' + sciLabel('diameter').split(' ')[0] || '物理参数',
                i18nKey: 'diameter',
                rows: [
                    { label:i18n[currentLang].sci.diameter || '直径', val:sci.diameter },
                    { label:i18n[currentLang].sci.mass || '质量', val:sci.mass },
                    { label:i18n[currentLang].sci.gravity || '重力', val:sci.gravity },
                    { label:i18n[currentLang].sci.density || '密度', val:sci.density, cond:true }
                ]
            },
            {
                label: '🌡️ ' + (i18n[currentLang].sci.temperature || '环境数据'),
                i18nKey: 'temperature',
                rows: [
                    { label:i18n[currentLang].sci.temperature || '表面温度', val:sci.temp },
                    { label:i18n[currentLang].sci.atmosphere || '大气成分', val:sci.atmosphere },
                    { label:i18n[currentLang].sci.moons || '卫星数量', val:sci.moons !== undefined ? sci.moons + ' 颗' : null }
                ]
            },
            {
                label: '🔄 ' + (i18n[currentLang].sci.yearLength || '轨道信息'),
                i18nKey: 'yearLength',
                rows: [
                    { label:i18n[currentLang].sci.auDist || '距太阳', val:sci.auDist !== undefined ? sci.auDist + ' AU' : null },
                    { label:i18n[currentLang].sci.yearLength || '公转周期', val:sci.yearLength },
                    { label:i18n[currentLang].sci.dayLength || '自转周期', val:sci.dayLength },
                    { label:i18n[currentLang].sci.axialTilt || '轴倾斜角', val:sci.axialTilt }
                ]
            },
            {
                label: '🔭 ' + (i18n[currentLang].sci.discoverer || '发现信息'),
                i18nKey: 'discoverer',
                rows: [
                    { label:'发现者', val:sci.discoverer },
                    { label:'发现年份', val:sci.discoverYear }
                ]
            }
        ];

        categories.forEach(function(cat) {
            // 过滤掉无数据的行
            var validRows = cat.rows.filter(function(r) { return r.val !== null && r.val !== undefined && r.val !== '—'; });
            if (validRows.length === 0) return;

            // 使用 i18n 翻译分类标签
            var catLabel = cat.label;
            var catKey = cat.i18nKey || '';
            if (catKey) catLabel = _('sci.' + catKey) || catLabel;

            html += '<div style="margin-top:10px;">' +
                '<div style="color:#4488aa;font-size:11px;font-weight:600;margin-bottom:4px;letter-spacing:1px;">' + catLabel + '</div>';

            validRows.forEach(function(row) {
                html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.03);">' +
                    '<span style="color:#667788;font-size:12px;">' + row.label + '</span>' +
                    '<span style="color:#c0d0e0;font-size:12px;font-weight:500;font-family:\'Consolas\',monospace;">' + row.val + '</span>' +
                '</div>';
            });

            html += '</div>';
        });

        // 数据来源标注（i18n）
        html += '<div style="margin-top:10px;padding-top:6px;border-top:1px solid rgba(0,200,255,0.08);text-align:center;color:#445566;font-size:10px;">' +
            '📡 ' + (currentLang === 'zh' ? '数据来源：NASA 太阳系探索' : 'Data: NASA Solar System Exploration') + '</div>';

        return html;
    }
})();

// ===== 标签切换按钮 =====
function setupLabelsToggle() {
    var btn = document.createElement('button');
    btn.id = 'labelToggle';
    btn.innerHTML = '🏷️';
    btn.title = '切换名称标注';
    btn.style.cssText = 'position:fixed;top:110px;right:20px;z-index:1500;' +
        'background:rgba(0,20,40,0.7);border:1px solid rgba(0,200,255,0.3);color:#00ddff;' +
        'padding:8px 12px;border-radius:8px;cursor:pointer;font-size:18px;' +
        'backdrop-filter:blur(6px);';
    btn.onclick = function() {
        SPACEDEMO.labelsVisible = !SPACEDEMO.labelsVisible;
        SPACEDEMO.labelObjects.forEach(function(lo) {
            lo.div.style.display = SPACEDEMO.labelsVisible ? '' : 'none';
        });
        btn.style.borderColor = SPACEDEMO.labelsVisible ? 'rgba(0,200,255,0.3)' : 'rgba(255,100,0,0.5)';
        btn.style.color = SPACEDEMO.labelsVisible ? '#00ddff' : '#ff8800';
    };
    document.body.appendChild(btn);
}

// ===== 语言切换按钮 =====
function setupLangToggle() {
    var btn = document.createElement('button');
    btn.id = 'langToggle';
    btn.innerHTML = currentLang === 'zh' ? '🇨🇳 中' : '🇬🇧 EN';
    btn.title = currentLang === 'zh' ? '切换到英文' : 'Switch to Chinese';
    btn.style.cssText = 'position:fixed;top:150px;right:20px;z-index:1500;' +
        'background:rgba(0,20,40,0.7);border:1px solid rgba(0,200,255,0.3);color:#00ddff;' +
        'padding:8px 12px;border-radius:8px;cursor:pointer;font-size:13px;' +
        'backdrop-filter:blur(6px);';
    btn.onclick = function() {
        currentLang = currentLang === 'zh' ? 'en' : 'zh';
        btn.innerHTML = currentLang === 'zh' ? '🇨🇳 中' : '🇬🇧 EN';
        btn.title = currentLang === 'zh' ? '切换到英文' : 'Switch to Chinese';
        updateUILanguage();
        // 如果当前有显示信息卡片，刷新它
        var card = document.getElementById('planetCard');
        if (card && card.style.bottom !== '-500px') {
            // 触发重新显示（通过已存储的数据）
            if (window._lastCardData) showPlanetCard(window._lastCardData);
        }
    };
    document.body.appendChild(btn);
}

// ===== 全屏沉浸按钮 =====
function setupFullscreenToggle() {
    var btn = document.createElement('button');
    btn.id = 'fullscreenBtn';
    btn.innerHTML = '⛶';
    btn.title = '全屏沉浸模式';
    btn.style.cssText = 'position:fixed;top:20px;right:20px;z-index:1500;' +
        'background:rgba(0,20,40,0.7);border:1px solid rgba(0,200,255,0.3);color:#00ddff;' +
        'padding:8px 12px;border-radius:8px;cursor:pointer;font-size:20px;' +
        'backdrop-filter:blur(6px);';
    btn.onclick = function() {
        SPACEDEMO.isFullscreen = !SPACEDEMO.isFullscreen;
        var container = SPACEDEMO.container;
        if (SPACEDEMO.isFullscreen) {
            container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:2000;';
            btn.innerHTML = '⛶';
            btn.style.color = '#ff8800';
        } else {
            container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;';
            btn.innerHTML = '⛶';
            btn.style.color = '#00ddff';
        }
        SPACEDEMO.renderer.setSize(window.innerWidth, window.innerHeight);
        if (SPACEDEMO.labelRenderer) {
            SPACEDEMO.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        }
        SPACEDEMO.camera.aspect = window.innerWidth / window.innerHeight;
        SPACEDEMO.camera.updateProjectionMatrix();
    };
    document.body.appendChild(btn);
}

// ===== 自动漫游 =====
var tourRoute = [];
var tourIndex = -1;
var tourActive = false;
var tourTimer = 0;
var tourTransitioning = false;
var tourStartCamPos = new THREE.Vector3();
var tourStartTarget = new THREE.Vector3();
var tourEndCamPos = new THREE.Vector3();
var tourEndTarget = new THREE.Vector3();
var tourProgress = 0;

function setupAutoTour() {
    var btn = document.createElement('button');
    btn.id = 'tourBtn';
    btn.innerHTML = '🎬';
    btn.title = '自动漫游';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:1500;' +
        'background:rgba(0,20,40,0.7);border:1px solid rgba(0,200,255,0.3);color:#00ddff;' +
        'padding:8px 12px;border-radius:8px;cursor:pointer;font-size:20px;' +
        'backdrop-filter:blur(6px);';
    btn.onclick = function() {
        if (!tourActive) {
            startTour();
            btn.style.color = '#ff8800';
            btn.style.borderColor = 'rgba(255,100,0,0.5)';
        } else {
            stopTour();
            btn.style.color = '#00ddff';
            btn.style.borderColor = 'rgba(0,200,255,0.3)';
        }
    };
    document.body.appendChild(btn);
}

function buildTourRoute() {
    tourRoute = [];
    // 主行星
    if (SPACEDEMO.planets) {
        SPACEDEMO.planets.forEach(function(p) { tourRoute.push(p); });
    }
    // 矮行星
    if (SPACEDEMO.pluto) tourRoute.push({ mesh: SPACEDEMO.pluto.mesh, data: SPACEDEMO.pluto.data });
    if (SPACEDEMO.ceres) tourRoute.push({ mesh: SPACEDEMO.ceres.mesh, data: SPACEDEMO.ceres.data });
    if (SPACEDEMO.eris) tourRoute.push({ mesh: SPACEDEMO.eris.mesh, data: SPACEDEMO.eris.data });
    // 彗星
    if (SPACEDEMO.comet) tourRoute.push({ mesh: SPACEDEMO.comet.mesh, data: SPACEDEMO.comet.data });
}

function startTour() {
    buildTourRoute();
    if (tourRoute.length === 0) return;
    tourActive = true;
    tourIndex = -1;
    tourTimer = 0;
    tourTransitioning = false;
    nextTourStop();
}

function stopTour() {
    tourActive = false;
    tourTransitioning = false;
    tourIndex = -1;
    // 显示提示（i18n）
    var tipBar = document.getElementById('tipBar');
    if (tipBar) {
        tipBar.textContent = _('tipBarTour');
        tipBar.style.opacity = '1';
    }
}

function nextTourStop() {
    tourIndex++;
    if (tourIndex >= tourRoute.length) {
        tourIndex = 0; // 循环
    }
    var stop = tourRoute[tourIndex];
    if (!stop || !stop.mesh) {
        stopTour();
        return;
    }

    // 计算目标相机位置
    var target = stop.mesh.position.clone();
    var dist = (stop.data && stop.data.radius) ? stop.data.radius * 6 : 5;
    if (dist < 3) dist = 3;
    if (dist > 40) dist = 40;

    var camPos = target.clone().add(new THREE.Vector3(dist * 0.6, dist * 0.4, dist));

    // 保存起止位置
    tourStartCamPos.copy(SPACEDEMO.camera.position);
    tourStartTarget.copy(SPACEDEMO.controls.target);
    tourEndCamPos.copy(camPos);
    tourEndTarget.copy(target);
    tourProgress = 0;
    tourTimer = 0;
    tourTransitioning = true;

    // 更新提示栏（i18n）
    var tipBar = document.getElementById('tipBar');
    if (tipBar) {
        var name = stop.data && stop.data.name ? stop.data.name : '—';
        var icon = stop.data && stop.data.icon ? stop.data.icon : '🪐';
        tipBar.innerHTML = _('tipBarTourActive') + icon + ' ' + name + ' (' + (tourIndex+1) + '/' + tourRoute.length + ')';
        tipBar.style.opacity = '1';
    }
}

function updateTour() {
    if (!tourActive) return;

    if (tourTransitioning) {
        tourProgress += 0.02;
        if (tourProgress >= 1) {
            tourProgress = 1;
            tourTransitioning = false;
            tourTimer = 0;
        }
        // 平滑插值
        var t = tourProgress;
        var ease = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2; // easeInOutQuad
        SPACEDEMO.camera.position.lerpVectors(tourStartCamPos, tourEndCamPos, ease);
        SPACEDEMO.controls.target.lerpVectors(tourStartTarget, tourEndTarget, ease);
    } else {
        // 停留 ~3 秒
        tourTimer += 0.016;
        // 微旋转镜头
        var stop = tourRoute[tourIndex];
        if (stop && stop.mesh) {
            var orbitAngle = 0.001 * tourTimer;
            var dist = SPACEDEMO.camera.position.distanceTo(SPACEDEMO.controls.target);
            var dir = SPACEDEMO.camera.position.clone().sub(SPACEDEMO.controls.target).normalize();
            var right = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
            var up = dir.clone().cross(right).normalize();
            var newDir = dir.clone().applyAxisAngle(up, orbitAngle);
            SPACEDEMO.camera.position.copy(SPACEDEMO.controls.target).add(newDir.multiplyScalar(dist));
            // 让标签高亮
            SPACEDEMO.labelObjects.forEach(function(lo) {
                if (lo.data === stop.data) lo.div.classList.add('focused');
                else lo.div.classList.remove('focused');
            });
        }
        if (tourTimer >= 3) {
            nextTourStop();
        }
    }
}

// ===== 聚焦环 + 聚焦/复位逻辑 =====
function focusOnPlanet(planetEntry) {
    var target = planetEntry.mesh.position.clone();
    var camTarget = new THREE.Vector3(
        target.x + planetEntry.data.radius * 3,
        target.y + planetEntry.data.radius * 2,
        target.z + planetEntry.data.radius * 3
    );
    SPACEDEMO.focusAnim = {
        startTarget: SPACEDEMO.controls.target.clone(),
        endTarget: target,
        startCam: SPACEDEMO.camera.position.clone(),
        endCam: camTarget,
        progress: 0
    };
    SPACEDEMO.focusedPlanet = planetEntry;
    // 缩放滑块同步到目标距离
    var dist = planetEntry.data.radius * 4;
    SPACEDEMO.targetZoomDist = dist;
    var sliderVal = zoomToSlider(dist);
    var slider = document.getElementById('zoomSlider');
    if (slider) slider.value = sliderVal;
    // 隐藏提示栏
    var tipBar = document.getElementById('tipBar');
    if (tipBar) tipBar.style.opacity = '0';
    // 导航高亮
    if (typeof highlightNav === 'function') highlightNav(planetEntry.data.name);
}

function resetFocus() {
    SPACEDEMO.focusAnim = {
        startTarget: SPACEDEMO.controls.target.clone(),
        endTarget: new THREE.Vector3(0, 0, 0),
        startCam: SPACEDEMO.camera.position.clone(),
        endCam: new THREE.Vector3(0, 60, 100),
        progress: 0
    };
    SPACEDEMO.focusedPlanet = null;
    SPACEDEMO.targetZoomDist = 100;
    var sliderVal = zoomToSlider(100);
    var slider = document.getElementById('zoomSlider');
    if (slider) slider.value = sliderVal;
    var tipBar = document.getElementById('tipBar');
    if (tipBar) tipBar.style.opacity = '1';
    // 清除导航高亮
    if (typeof clearNavHighlight === 'function') clearNavHighlight();
}

// ===== 缩放滑块 =====
function setupZoomSlider() {
    var container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:16px;top:50%;transform:translateY(-50%);' +
        'z-index:1500;display:flex;flex-direction:column;align-items:center;gap:4px;' +
        'background:rgba(0,10,30,0.6);padding:10px 6px;border-radius:12px;' +
        'border:1px solid rgba(0,200,255,0.15);backdrop-filter:blur(6px);';

    var label = document.createElement('div');
    label.textContent = '🔍';
    label.style.cssText = 'color:#00ddff;font-size:14px;text-align:center;';

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'zoomSlider';
    slider.min = 0; slider.max = 1000; slider.value = zoomToSlider(100);
    slider.style.cssText = 'writing-mode:vertical-lr;direction:rtl;' +
        'width:8px;height:180px;cursor:pointer;accent-color:#00ffff;' +
        'background:linear-gradient(to bottom,#00ffff,#333);border-radius:4px;outline:none;margin:4px 0;';

    var valueLabel = document.createElement('div');
    valueLabel.id = 'zoomValue';
    valueLabel.textContent = '36%';
    valueLabel.style.cssText = 'color:#8899aa;font-size:11px;text-align:center;font-family:monospace;';

    container.appendChild(label);
    container.appendChild(slider);
    container.appendChild(valueLabel);
    document.body.appendChild(container);

    slider.addEventListener('input', function() {
        zoomFromSlider = true;
        var dist = sliderToZoom(parseInt(this.value));
        SPACEDEMO.targetZoomDist = dist;
        // 更新百分比显示
        var pct = Math.round((1 - (dist - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)) * 100);
        document.getElementById('zoomValue').textContent = pct + '%';
    });
}

// ===== 时间控制面板 =====
function setupTimeControls() {
    var panel = document.createElement('div');
    panel.id = 'timePanel';
    panel.style.cssText = 'position:fixed;bottom:70px;left:50%;transform:translateX(-50%);' +
        'z-index:1500;display:flex;align-items:center;gap:10px;' +
        'background:rgba(0,10,30,0.7);border:1px solid rgba(0,200,255,0.2);' +
        'padding:8px 16px;border-radius:20px;backdrop-filter:blur(6px);';

    var pauseBtn = document.createElement('button');
    pauseBtn.id = 'pauseBtn';
    pauseBtn.innerHTML = '⏸';
    pauseBtn.style.cssText = 'background:none;border:none;color:#00ddff;font-size:18px;cursor:pointer;padding:4px;';
    pauseBtn.onclick = function() {
        isPaused = !isPaused;
        pauseBtn.innerHTML = isPaused ? '▶' : '⏸';
        pauseBtn.style.color = isPaused ? '#ff8800' : '#00ddff';
    };

    var speedLabel = document.createElement('span');
    speedLabel.style.cssText = 'color:#8899aa;font-size:12px;min-width:28px;';
    speedLabel.textContent = '1×';

    var speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = -200; speedSlider.max = 300; speedSlider.value = 0;
    speedSlider.style.cssText = 'width:120px;accent-color:#00ffff;cursor:pointer;';
    speedSlider.oninput = function() {
        var v = parseInt(this.value);
        if (v === 0) { speedMultiplier = 1; speedLabel.textContent = '1×'; }
        else if (v < 0) { speedMultiplier = Math.pow(10, v / 100); speedLabel.textContent = speedMultiplier.toFixed(2) + '×'; }
        else { speedMultiplier = Math.pow(10, v / 100); speedLabel.textContent = speedMultiplier.toFixed(0) + '×'; }
    };

    var dateLabel = document.createElement('span');
    dateLabel.id = 'dateLabel';
    dateLabel.style.cssText = 'color:#445566;font-size:10px;font-family:monospace;min-width:120px;text-align:center;';

    // 日期输入框（日期跳转）
    var dateInput = document.createElement('input');
    dateInput.type = 'datetime-local';
    dateInput.id = 'dateJumpInput';
    dateInput.style.cssText = 'background:rgba(0,20,40,0.6);border:1px solid rgba(0,200,255,0.2);' +
        'color:#00ddff;font-size:11px;padding:2px 6px;border-radius:6px;width:170px;' +
        'cursor:pointer;';
    // 设置默认值为当前模拟时间
    var now = new Date();
    dateInput.value = now.getFullYear() + '-' +
        String(now.getMonth()+1).padStart(2,'0') + '-' +
        String(now.getDate()).padStart(2,'0') + 'T' +
        String(now.getHours()).padStart(2,'0') + ':' +
        String(now.getMinutes()).padStart(2,'0');
    dateInput.title = '输入日期后按回车跳转';

    dateInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            var val = this.value;
            if (val) {
                var targetDate = new Date(val);
                if (!isNaN(targetDate.getTime())) {
                    setSimulationDate(targetDate);
                    // 闪烁反馈
                    this.style.borderColor = '#00ff88';
                    setTimeout(function() {
                        if (dateInput) dateInput.style.borderColor = 'rgba(0,200,255,0.2)';
                    }, 500);
                }
            }
        }
    });
    // 点击右侧小箭头时自动填入当前模拟时间
    dateInput.addEventListener('focus', function() {
        var d = getSimDate();
        this.value = d.getFullYear() + '-' +
            String(d.getMonth()+1).padStart(2,'0') + '-' +
            String(d.getDate()).padStart(2,'0') + 'T' +
            String(d.getHours()).padStart(2,'0') + ':' +
            String(d.getMinutes()).padStart(2,'0');
    });

    panel.appendChild(pauseBtn);
    panel.appendChild(speedSlider);
    panel.appendChild(speedLabel);
    panel.appendChild(dateLabel);
    panel.appendChild(dateInput);
    document.body.appendChild(panel);
}

function updateDateLabel() {
    var el = document.getElementById('dateLabel');
    if (el) {
        var d = getSimDate();
        // 使用浏览器本地时区显示
        var tzName = '';
        try {
            tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            if (tzName) tzName = tzName.replace('_', ' ').split('/').pop();
        } catch(e) {}
        el.textContent = d.getFullYear() + '-' +
            String(d.getMonth()+1).padStart(2,'0') + '-' +
            String(d.getDate()).padStart(2,'0') + ' ' +
            String(d.getHours()).padStart(2,'0') + ':' +
            String(d.getMinutes()).padStart(2,'0') +
            (tzName ? ' ' + tzName : '');
    }
}

// ===== 提示栏（使用 i18n）=====
function setupTipBar() {
    var bar = document.createElement('div');
    bar.id = 'tipBar';
    bar.textContent = _('tipBar');
    bar.style.cssText = 'position:fixed;bottom:115px;left:50%;transform:translateX(-50%);' +
        'z-index:1400;color:#445566;font-size:12px;text-align:center;' +
        'background:rgba(0,10,30,0.5);padding:6px 16px;border-radius:12px;' +
        'transition:opacity 0.5s;white-space:nowrap;';
    document.body.appendChild(bar);
}

// ===== 交互事件 =====
function setupInteractionEvents() {
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var lastClickTime = 0;
    var lastClickPos = { x: 0, y: 0 };

    SPACEDEMO.renderer.domElement.addEventListener('click', function(event) {
        var now = Date.now();
        var rect = SPACEDEMO.renderer.domElement.getBoundingClientRect();
        var mx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        var my = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // 检测双击
        var timeDelta = now - lastClickTime;
        var distDelta = Math.sqrt(
            Math.pow(event.clientX - lastClickPos.x, 2) +
            Math.pow(event.clientY - lastClickPos.y, 2)
        );
        lastClickTime = now;
        lastClickPos.x = event.clientX;
        lastClickPos.y = event.clientY;

        if (timeDelta < 400 && distDelta < 10) {
            // 双击
            mouse.x = mx; mouse.y = my;
            raycaster.setFromCamera(mouse, SPACEDEMO.camera);
            var intersects = raycaster.intersectObjects(SPACEDEMO.clickables);
            if (intersects.length > 0) {
                var hit = intersects[0].object;
                if (hit.userData && hit.userData.name) {
                    // 双击行星
                    var found = false;
                    SPACEDEMO.planets.forEach(function(p) {
                        if (p.data.name === hit.userData.name) {
                            found = true;
                            if (SPACEDEMO.focusedPlanet && SPACEDEMO.focusedPlanet.data.name === p.data.name) {
                                resetFocus();
                            } else {
                                focusOnPlanet(p);
                            }
                        }
                    });
                    // 双击冥王星
                    if (!found && SPACEDEMO.pluto && SPACEDEMO.pluto.data.name === hit.userData.name) {
                        if (SPACEDEMO.focusedPlanet && SPACEDEMO.focusedPlanet.data.name === SPACEDEMO.pluto.data.name) {
                            resetFocus();
                        } else {
                            focusOnPlanet(SPACEDEMO.pluto);
                        }
                        found = true;
                    }
                    // 双击彗星
                    if (!found && SPACEDEMO.comet && SPACEDEMO.comet.data.name === hit.userData.name) {
                        if (SPACEDEMO.focusedPlanet && SPACEDEMO.focusedPlanet.data.name === SPACEDEMO.comet.data.name) {
                            resetFocus();
                        } else {
                            focusOnPlanet(SPACEDEMO.comet);
                        }
                        found = true;
                    }
                    // 双击谷神星
                    if (!found && SPACEDEMO.ceres && SPACEDEMO.ceres.data.name === hit.userData.name) {
                        if (SPACEDEMO.focusedPlanet && SPACEDEMO.focusedPlanet.data.name === SPACEDEMO.ceres.data.name) {
                            resetFocus();
                        } else {
                            focusOnPlanet(SPACEDEMO.ceres);
                        }
                        found = true;
                    }
                    // 双击阋神星
                    if (!found && SPACEDEMO.eris && SPACEDEMO.eris.data.name === hit.userData.name) {
                        if (SPACEDEMO.focusedPlanet && SPACEDEMO.focusedPlanet.data.name === SPACEDEMO.eris.data.name) {
                            resetFocus();
                        } else {
                            focusOnPlanet(SPACEDEMO.eris);
                        }
                        found = true;
                    }
                    // 双击月球
                    if (!found && hit.userData.isMoon && SPACEDEMO.moonMesh) {
                        if (SPACEDEMO.focusedPlanet && SPACEDEMO.focusedPlanet.data && SPACEDEMO.focusedPlanet.data.name === '月球') {
                            resetFocus();
                        } else {
                            // 为月球构建临时聚焦对象
                            var moonFocus = {
                                mesh: SPACEDEMO.moonMesh,
                                data: { name:'月球', radius:0.28 }
                            };
                            focusOnPlanet(moonFocus);
                        }
                        found = true;
                    }
                    if (found) return;
                }
            }
            // 双击空白 → 复位
            resetFocus();
            return;
        }

        // 单击
        mouse.x = mx; mouse.y = my;
        raycaster.setFromCamera(mouse, SPACEDEMO.camera);
        var intersects = raycaster.intersectObjects(SPACEDEMO.clickables);
        if (intersects.length > 0) {
            var hit = intersects[0].object;
            // 星座点击检测
            if (hit.userData && hit.userData.isConstellation) {
                if (typeof showConstellationInfo === 'function') {
                    showConstellationInfo(hit.userData.constellationIdx);
                }
                return;
            }
            // 行星点击检测
            if (hit.userData && hit.userData.name) {
                var found = false;
                SPACEDEMO.planets.forEach(function(p) {
                    if (p.data.name === hit.userData.name) {
                        showPlanetCard(p.data);
                        found = true;
                    }
                });
                // 单击冥王星
                if (!found && SPACEDEMO.pluto && SPACEDEMO.pluto.data.name === hit.userData.name) {
                    showPlanetCard(SPACEDEMO.pluto.data);
                    found = true;
                }
                // 单击彗星
                if (!found && SPACEDEMO.comet && SPACEDEMO.comet.data.name === hit.userData.name) {
                    showPlanetCard(SPACEDEMO.comet.data);
                    found = true;
                }
                // 单击谷神星
                if (!found && SPACEDEMO.ceres && SPACEDEMO.ceres.data.name === hit.userData.name) {
                    showPlanetCard(SPACEDEMO.ceres.data);
                    found = true;
                }
                // 单击阋神星
                if (!found && SPACEDEMO.eris && SPACEDEMO.eris.data.name === hit.userData.name) {
                    showPlanetCard(SPACEDEMO.eris.data);
                    found = true;
                }
                // 单击月球
                if (!found && hit.userData.isMoon && window.moonSciData) {
                    showPlanetCard(window.moonSciData);
                    // 在信息卡片上追加月相信息
                    var moonPhaseEl = document.createElement('div');
                    moonPhaseEl.id = 'moonPhaseInfo';
                    moonPhaseEl.style.cssText = 'text-align:center;font-size:13px;color:#88bbdd;padding:4px 0 8px;';
                    var cardSci = document.getElementById('cardSciData');
                    if (cardSci) {
                        // 插入月相信息
                        var phaseText = typeof moonPhaseName !== 'undefined' ? moonPhaseName : '🌑 新月';
                        // 英文模式时使用 i18n 月相名
                        if (currentLang === 'en' && typeof moonPhaseAngle !== 'undefined') {
                            var phaseEn = i18n.en.phaseNames;
                            var a = moonPhaseAngle % (Math.PI * 2);
                            if (a < 0) a += Math.PI * 2;
                            var idx = a < 0.25 || a >= 6.0 ? 0 : a < 1.0 ? 1 : a < 1.8 ? 2 : a < 2.5 ? 3 : a < 3.8 ? 4 : a < 4.5 ? 5 : a < 5.3 ? 6 : 7;
                            phaseText = phaseEn[idx];
                        }
                        moonPhaseEl.innerHTML = _('moonPhase') + '<strong>' + phaseText + '</strong>';
                        cardSci.parentNode.insertBefore(moonPhaseEl, cardSci);
                    }
                    found = true;
                }
                // 单击大卫星（木卫/土卫）
                if (!found && hit.userData.isLargeMoon) {
                    var moonData = {
                        name: hit.userData.name,
                        enName: hit.userData.enName || '',
                        icon: '🛰️',
                        info: { ch: hit.userData.parentName + '的天然卫星', en: 'Natural satellite of ' + (hit.userData.parentName || 'planet') },
                        sci: {
                            diameter: '约3,000~5,200 km',
                            mass: '7×10²²~1.5×10²³ kg',
                            gravity: '1.0~1.8 m/s²',
                            temperature: '-160~-130°C',
                            atmosphere: hit.userData.name === '土卫六' ? '浓厚氮气大气层' : '极稀薄或无',
                            dayLength: '潮汐锁定',
                            parent: hit.userData.parentName || ''
                        }
                    };
                    showPlanetCard(moonData);
                    found = true;
                }
            }
        }
    });

    // ESC 退出聚焦 / 退出漫游
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (typeof tourActive !== 'undefined' && tourActive) {
                stopTour();
                var tb = document.getElementById('tourBtn');
                if (tb) { tb.style.color = '#00ddff'; tb.style.borderColor = 'rgba(0,200,255,0.3)'; }
            } else if (SPACEDEMO.mapModeActive) {
                exitMapMode();
            } else if (SPACEDEMO.focusedPlanet) {
                resetFocus();
            } else if (SPACEDEMO.isFullscreen) {
                document.getElementById('fullscreenBtn').onclick();
            }
        }
    });
}

// ===== 自适应（使用 ResizeObserver）=====
function setupResizeHandler() {
    var container = SPACEDEMO.container;
    var ro = new ResizeObserver(function() {
        var cw = container.clientWidth, ch = container.clientHeight;
        if (cw > 0 && ch > 0) {
            SPACEDEMO.camera.aspect = cw / ch;
            SPACEDEMO.camera.updateProjectionMatrix();
            SPACEDEMO.renderer.setSize(cw, ch);
            if (SPACEDEMO.labelRenderer) {
                SPACEDEMO.labelRenderer.setSize(cw, ch);
            }
        }
    });
    ro.observe(container);
}
