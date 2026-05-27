# 🌌 太空探索博物馆 - 3D 太阳系模拟器

> **已部署上线！** 👉 [https://yexuejc.github.io/space-exhibition-museum/](https://yexuejc.github.io/space-exhibition-museum/)

![Website](https://img.shields.io/badge/status-online-brightgreen)
![Three.js](https://img.shields.io/badge/Three.js-r128-blue)
![WebXR](https://img.shields.io/badge/WebXR-ready-purple)

---

## 🚀 项目亮点

- **沉浸式粒子星空背景** — 动效粒子系统营造深邃宇宙感
- **真实比例太阳系** — 基于真实行星直径比例计算（pow 0.37 视觉压缩）
- **真实公转/自转周期** — 从当前时间开始模拟，支持时间加速（0.01× ~ 1000×）
- **NASA 高清地球纹理** — 地球使用真实 Blue Marble 卫星影像，可见大陆轮廓
- **高拟真程序化纹理** — 木星大红斑、土星环、陨石坑等细节
- **行星名称标注** — CSS2D 标注，拉近自动显示，一键开关
- **交互式行星信息卡** — 单击查看科普信息
- **双击追踪聚焦** — 双击行星平滑追踪，双击空白归位
- **左侧竖排缩放滑块** — 精细控制视角距离（可贴到行星表面）
- **🌍 高德地图模式** — 拉近地球可进入地图模式（需自行配置 API Key）
- **全屏沉浸模式** — ⛶ 一键铺满全屏
- **VR 模式支持** — 支持 WebXR 头显设备

## 🛠 技术栈

| 技术 | 用途 |
|------|------|
| Three.js r128 | 3D 渲染引擎 |
| OrbitControls | 鼠标/触控交互控制 |
| CSS2DRenderer | 行星名称标注 |
| WebXR | 虚拟现实模式 |
| 高德地图 JS API | 地球地图模式 |
| Canvas 2D | 粒子星空 + 程序化纹理生成 |
| Simplex Noise | 纹理噪声生成算法 |
| HTML5 + CSS3 | 页面结构与视觉设计 |

## 📂 文件结构

```
├── index.html    # 主页面
├── style.css     # 视觉样式（深空主题）
├── script.js     # 3D 场景 + 交互逻辑（815行）
├── textures/     # 本地纹理缓存（可选）
└── README.md     # 本文件
```

## 🎮 交互指南

| 操作 | 效果 |
|------|------|
| 🖱️ 拖拽 | 旋转视角 |
| 🔄 滚轮 | 缩放拉近/拉远 |
| 👆 **单击** 行星 | 弹出科普信息卡片 |
| 👆👆 **双击** 行星 | 聚焦追踪（行星保持在画面中央） |
| 👆👆 **双击** 空白 | 归位看太阳 |
| 🔍 左侧滑块 | 精细控制缩放级别 |
| 🕐 右下角面板 | 时间加速/暂停 |
| 🏷️ 右上角按钮 | 切换名称标注 |
| 🗺️ 右上角按钮 | 进入地球地图模式（需 Key） |
| ⛶ 右上角按钮 | 全屏沉浸模式 |
| 🥽 右下角按钮 | VR 模式 |
| ⌨️ ESC | 退出聚焦 / 退出地图模式 |

## 🗺️ 配置高德地图（可选）

地图模式需要高德地图 JS API Key。这是开源项目，**请自行申请**：

1. 访问 [高德开放平台](https://lbs.amap.com/) 注册账号
2. 进入控制台 → 应用管理 → 创建新应用
3. 添加 Key，选择「Web端(JS API)」
4. 填写域名白名单（开发时可填 `*`，生产建议限制域名）
5. 打开页面 → 聚焦地球拉近 → 点击 🗺️ 按钮 → 在弹出的窗口中输入 Key

> Key 仅保存在浏览器 `localStorage` 中，不会上传，刷新后自动加载。

## 🧑‍💻 本地运行

```bash
# 克隆仓库
git clone https://github.com/yexuejc/space-exhibition-museum.git
cd space-exhibition-museum

# 直接浏览器打开 index.html 即可
# 或运行本地服务器（推荐，避免 CORS 问题）
python -m http.server 8000
# 访问 http://localhost:8000
```

## 📜 许可证

MIT License © 2026 [yexuejc](https://github.com/yexuejc)

---

**如果喜欢这个项目，欢迎 ⭐ Star 支持！** 🌟
