// ===== 太空探索博物馆 - 行星数据 =====
// 所有常量与静态数据
// 科学数据来源：NASA 太阳系探索 / 公开天文数据

var SUN_RADIUS = 5;
var ZOOM_MIN = 0.05;
var ZOOM_MAX = 180;

var planetData = [
    {
        name:'水星', icon:'☿', realRatio:0.00382, dist:8, color:0xaaaaaa,
        orbitalPeriod:0.241, rotationPeriod:58.646,
        L0:252.25084, texType:'crater',
        // 科普简介
        info:{ ch:'最小行星，表面温差极大（-180~430°C）。',
               en:'Smallest planet, extreme temperature swings.' },
        // 科学数据
        sci:{
            diameter:'4,879 km',
            mass:'3.301×10²³ kg',
            gravity:'3.70 m/s²',
            density:'5.43 g/cm³',
            temp:'-180~430°C',
            atmosphere:'极稀薄（钠、钾、氧）',
            moons:0,
            auDist:0.39,
            dayLength:'58.65 天',
            yearLength:'88 天',
            axialTilt:'0.034°',
            discoverer:'已知自古',
            discoverYear:'—'
        }
    },
    {
        name:'金星', icon:'♀', realRatio:0.00949, dist:12, color:0xe8c060,
        orbitalPeriod:0.615, rotationPeriod:-243.025,
        L0:181.97973, texType:'swirl',
        info:{ ch:'最热行星，大气压是地球的92倍，自转方向相反。',
               en:'Hottest planet, 92x Earth\'s pressure, retrograde rotation.' },
        sci:{
            diameter:'12,104 km',
            mass:'4.867×10²⁴ kg',
            gravity:'8.87 m/s²',
            density:'5.24 g/cm³',
            temp:'462°C（均温）',
            atmosphere:'CO₂ 96.5%, N₂ 3.5%',
            moons:0,
            auDist:0.72,
            dayLength:'243 天（逆向）',
            yearLength:'225 天',
            axialTilt:'177.4°',
            discoverer:'已知自古',
            discoverYear:'—'
        }
    },
    {
        name:'地球', icon:'🌍', realRatio:0.00917, dist:16, color:0x4488ff,
        orbitalPeriod:1.0, rotationPeriod:1.0,
        L0:100.46435, texType:'earth_real',
        info:{ ch:'我们的家园，唯一已知存在生命的行星。',
               en:'Our home, the only known planet with life.' },
        sci:{
            diameter:'12,742 km',
            mass:'5.972×10²⁴ kg',
            gravity:'9.81 m/s²',
            density:'5.51 g/cm³',
            temp:'-89~57°C',
            atmosphere:'N₂ 78%, O₂ 21%, Ar 0.9%',
            moons:1,
            auDist:1.00,
            dayLength:'24 小时',
            yearLength:'365.25 天',
            axialTilt:'23.44°',
            discoverer:'已知自古',
            discoverYear:'—'
        }
    },
    {
        name:'火星', icon:'♂', realRatio:0.00487, dist:22, color:0xdd6644,
        orbitalPeriod:1.881, rotationPeriod:1.02596,
        L0:355.45332, texType:'mars',
        info:{ ch:'红色星球，拥有太阳系最高山峰。',
               en:'Red Planet, home to the solar system\'s tallest mountain.' },
        sci:{
            diameter:'6,779 km',
            mass:'6.417×10²³ kg',
            gravity:'3.72 m/s²',
            density:'3.93 g/cm³',
            temp:'-140~20°C',
            atmosphere:'CO₂ 95%, N₂ 2.8%, Ar 2%',
            moons:2,
            auDist:1.52,
            dayLength:'24.6 小时',
            yearLength:'687 天',
            axialTilt:'25.19°',
            discoverer:'已知自古',
            discoverYear:'—'
        }
    },
    {
        name:'木星', icon:'♃', realRatio:0.1027, dist:28, color:0xd4a574,
        orbitalPeriod:11.862, rotationPeriod:0.41354,
        L0:34.33479, texType:'jupiter',
        info:{ ch:'最大行星，大红斑风暴已持续数百年。',
               en:'Largest planet, Great Red Spot storm for centuries.' },
        sci:{
            diameter:'139,820 km',
            mass:'1.898×10²⁷ kg',
            gravity:'24.79 m/s²',
            density:'1.33 g/cm³',
            temp:'-108°C（云顶）',
            atmosphere:'H₂ 90%, He 10%',
            moons:95,
            auDist:5.20,
            dayLength:'9.9 小时',
            yearLength:'11.86 年',
            axialTilt:'3.13°',
            discoverer:'已知自古',
            discoverYear:'—'
        }
    },
    {
        name:'土星', icon:'♄', realRatio:0.0865, dist:36, color:0xeeddbb,
        orbitalPeriod:29.457, rotationPeriod:0.44403,
        L0:49.94424, texType:'saturn',
        hasRing:true,
        info:{ ch:'以壮观的环系统闻名，密度低于水，有82颗已知卫星。',
               en:'Spectacular ring system, less dense than water.' },
        sci:{
            diameter:'116,460 km',
            mass:'5.683×10²⁶ kg',
            gravity:'10.44 m/s²',
            density:'0.69 g/cm³',
            temp:'-139°C（云顶）',
            atmosphere:'H₂ 96%, He 3%',
            moons:146,
            auDist:9.54,
            dayLength:'10.7 小时',
            yearLength:'29.46 年',
            axialTilt:'26.73°',
            discoverer:'已知自古',
            discoverYear:'—'
        }
    },
    {
        name:'天王星', icon:'♅', realRatio:0.0367, dist:44, color:0x44aaff,
        orbitalPeriod:84.011, rotationPeriod:-0.71833,
        L0:313.23218, texType:'smooth',
        info:{ ch:'冰巨星，自转轴几乎与轨道平行，"躺着"转。',
               en:'Ice giant with extreme 98° axial tilt.' },
        sci:{
            diameter:'50,724 km',
            mass:'8.681×10²⁵ kg',
            gravity:'8.87 m/s²',
            density:'1.27 g/cm³',
            temp:'-197°C',
            atmosphere:'H₂ 82.5%, He 15.2%, CH₄ 2.3%',
            moons:27,
            auDist:19.19,
            dayLength:'17.2 小时',
            yearLength:'84.01 年',
            axialTilt:'97.77°',
            discoverer:'威廉·赫歇尔',
            discoverYear:'1781'
        }
    },
    {
        name:'海王星', icon:'♆', realRatio:0.0356, dist:52, color:0x3344ee,
        orbitalPeriod:164.79, rotationPeriod:0.67125,
        L0:304.88003, texType:'banded',
        info:{ ch:'最远行星，风速可达2100km/h，太阳系风速最快。',
               en:'Fastest winds in solar system up to 2,100 km/h.' },
        sci:{
            diameter:'49,528 km',
            mass:'1.024×10²⁶ kg',
            gravity:'11.15 m/s²',
            density:'1.64 g/cm³',
            temp:'-201°C',
            atmosphere:'H₂ 80%, He 19%, CH₄ 1%',
            moons:16,
            auDist:30.07,
            dayLength:'16.1 小时',
            yearLength:'164.8 年',
            axialTilt:'28.32°',
            discoverer:'约翰·伽勒/勒维耶',
            discoverYear:'1846'
        }
    },
    // ===== 矮行星 =====
    {
        name:'冥王星', icon:'♇', realRatio:0.00218, dist:62, color:0xccbbaa,
        orbitalPeriod:247.94, rotationPeriod:-6.387,
        L0:163.0, texType:'pluto',
        isDwarf:true, // 矮行星标记
        // 轨道倾角（度），用于非平面轨道
        orbitalInclination: 17.16,
        // 轨道偏心率（视觉椭圆效果）
        orbitalEccentricity: 0.25,
        info:{ ch:'矮行星，曾经的第九大行星，冰质表面有标志性心形区域。',
               en:'Dwarf planet, formerly the 9th planet, with iconic heart-shaped region.' },
        sci:{
            diameter:'2,377 km',
            mass:'1.303×10²² kg',
            gravity:'0.62 m/s²',
            density:'1.86 g/cm³',
            temp:'-230°C',
            atmosphere:'N₂, CH₄, CO（稀薄）',
            moons:5,
            auDist:39.48,
            dayLength:'6.39 天',
            yearLength:'247.9 年',
            axialTilt:'122.53°',
            discoverer:'克莱德·汤博',
            discoverYear:'1930'
        }
    }
];

// 计算视觉压缩后的半径
planetData.forEach(function(p) {
    p.radius = SUN_RADIUS * Math.pow(p.realRatio, 0.37);
});

// ===== 彗星轨道参数 =====
// 高度椭圆轨道，近日点靠近太阳，远日点远出海王星
var cometData = {
    name:'哈雷彗星', icon:'☄️', color:0xccddff,
    // 轨道根数（视觉压缩空间）
    perihelionDist: 8,   // 近日点距离
    aphelionDist: 65,    // 远日点距离
    orbitalInclination: 30, // 轨道倾角（度）
    // 近日点经度（初始角度，度）
    argOfPerihelion: 45,
    // 公转周期（模拟年份）
    orbitalPeriod: 75,
    // 自转周期（小时，彗核缓慢旋转）
    rotationPeriod: 24,
    // 彗核半径
    radius: 0.6,
    info:{
        ch:'著名的周期性彗星，每75年回归一次。接近太阳时冰质升华形成壮观的离子尾和尘埃尾。',
        en:'Famous periodic comet, returns every ~75 years. Ice sublimates near the Sun forming spectacular ion and dust tails.'
    },
    sci:{
        diameter:'~15 km（彗核）',
        mass:'~2.2×10¹⁴ kg',
        gravity:'极低',
        density:'~0.6 g/cm³',
        temp:'近日点 ~100°C / 远日点 -250°C',
        atmosphere:'升华的气体（H₂O, CO, CO₂, CH₄）',
        moons:0,
        auDist:'0.6 ~ 35 AU',
        dayLength:'~24 小时',
        yearLength:'~75 年',
        axialTilt:'未知',
        discoverer:'古代观测记录，哈雷确定轨道',
        discoverYear:'1705（哈雷）'
    }
};
