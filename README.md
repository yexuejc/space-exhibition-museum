# 🌌 太空探索博物馆 - 360° VR 太阳系

> **已部署上线！** 👉 [https://yexuejc.github.io/space-exhibition-museum/](https://yexuejc.github.io/space-exhibition-museum/)

![Website](https://img.shields.io/badge/status-online-brightgreen)
![Three.js](https://img.shields.io/badge/Three.js-r165-blue)
![WebXR](https://img.shields.io/badge/WebXR-ready-purple)

---

## 🚀 项目亮点

- **沉浸式粒子星空背景** — 动效粒子系统营造深邃宇宙感
- **360° 3D 太阳系** — 基于 Three.js 构建，八大行星自转 + 公转
- **交互式行星信息卡** — 点击任意行星弹出详细科普卡片
- **VR 模式支持** — 支持 Oculus Quest / HTC Vive 等 WebXR 设备
- **程序化纹理** — 所有星球纹理代码生成，不依赖外部图片
- **响应式设计** — 完美适配手机、平板、桌面端
- **太空探索时间线** — 6 个里程碑展示人类太空探索史

## 🛠 技术栈

| 技术 | 用途 |
|------|------|
| Three.js r165 | 3D 渲染引擎 |
| OrbitControls | 鼠标/触控交互控制 |
| WebXR / VRButton | 虚拟现实模式 |
| tsParticles | 粒子星空特效 |
| HTML5 + CSS3 | 页面结构与视觉设计 |

## 📂 文件结构

```
├── index.html    # 主页面
├── style.css     # 视觉样式（深空主题）
├── script.js     # 3D 场景 + 交互逻辑
└── README.md     # 本文件
```

## 🎮 交互指南

| 操作 | 效果 |
|------|------|
| 🖱️ 拖拽 | 旋转视角 |
| 🔄 滚轮 | 缩放拉近/拉远 |
| 👆 点击行星 | 弹出信息卡片 |
| 🥽 Enter VR | 进入虚拟现实模式 |

## 🧑‍💻 本地运行

```bash
# 克隆仓库
git clone https://github.com/yexuejc/space-exhibition-museum.git
cd space-exhibition-museum

# 直接浏览器打开 index.html 即可
# 或运行本地服务器
python -m http.server 8000
# 访问 http://localhost:8000
```

## 🔮 后续计划

- [ ] 行星音频解说（中英文 TTS）
- [ ] AR 模式（手机相机叠加太阳系）
- [ ] 搜索/导航功能
- [ ] 真实 NASA 纹理替换
- [ ] 多语言切换

## 📜 许可证

MIT License © 2026 [yexuejc](https://github.com/yexuejc)

---

**如果喜欢这个项目，欢迎 ⭐ Star 支持！** 🌟
