// ===== 太空探索博物馆 - 行星数据 =====
// 所有常量与静态数据

var SUN_RADIUS = 5;
var ZOOM_MIN = 0.05;
var ZOOM_MAX = 180;

var planetData = [
    { name:'水星', icon:'☿', realRatio:0.00382, dist:8, color:0xaaaaaa,
      orbitalPeriod:0.241, rotationPeriod:58.646,
      L0:252.25084,
      texType:'crater',
      info:{ ch:'最小行星，表面温差极大（-180~430°C）。',
             en:'Smallest planet, extreme temperature swings.' } },
    { name:'金星', icon:'♀', realRatio:0.00949, dist:12, color:0xe8c060,
      orbitalPeriod:0.615, rotationPeriod:-243.025,
      L0:181.97973,
      texType:'swirl',
      info:{ ch:'最热行星，大气压是地球的92倍，自转方向相反。',
             en:'Hottest planet, 92x Earth\'s pressure, retrograde rotation.' } },
    { name:'地球', icon:'🌍', realRatio:0.00917, dist:16, color:0x4488ff,
      orbitalPeriod:1.0, rotationPeriod:1.0,
      L0:100.46435,
      texType:'earth_real',
      info:{ ch:'我们的家园，唯一已知存在生命的行星。',
             en:'Our home, the only known planet with life.' } },
    { name:'火星', icon:'♂', realRatio:0.00487, dist:22, color:0xdd6644,
      orbitalPeriod:1.881, rotationPeriod:1.02596,
      L0:355.45332,
      texType:'mars',
      info:{ ch:'红色星球，拥有太阳系最高山峰。',
             en:'Red Planet, home to the solar system\'s tallest mountain.' } },
    { name:'木星', icon:'♃', realRatio:0.1027, dist:28, color:0xd4a574,
      orbitalPeriod:11.862, rotationPeriod:0.41354,
      L0:34.33479,
      texType:'jupiter',
      info:{ ch:'最大行星，大红斑风暴已持续数百年。',
             en:'Largest planet, Great Red Spot storm for centuries.' } },
    { name:'土星', icon:'♄', realRatio:0.0865, dist:36, color:0xeeddbb,
      orbitalPeriod:29.457, rotationPeriod:0.44403,
      L0:49.94424,
      texType:'saturn',
      hasRing:true,
      info:{ ch:'以壮观的环系统闻名，密度低于水，有82颗已知卫星。',
             en:'Spectacular ring system, less dense than water.' } },
    { name:'天王星', icon:'♅', realRatio:0.0367, dist:44, color:0x44aaff,
      orbitalPeriod:84.011, rotationPeriod:-0.71833,
      L0:313.23218,
      texType:'smooth',
      info:{ ch:'冰巨星，自转轴几乎与轨道平行，"躺着"转。',
             en:'Ice giant with extreme 98° axial tilt.' } },
    { name:'海王星', icon:'♆', realRatio:0.0356, dist:52, color:0x3344ee,
      orbitalPeriod:164.79, rotationPeriod:0.67125,
      L0:304.88003,
      texType:'banded',
      info:{ ch:'最远行星，风速可达2100km/h，太阳系风速最快。',
             en:'Fastest winds in solar system up to 2,100 km/h.' } }
];

// 计算视觉压缩后的半径
planetData.forEach(function(p) {
    p.radius = SUN_RADIUS * Math.pow(p.realRatio, 0.37);
});
