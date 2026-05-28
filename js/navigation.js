// ===== 太空探索博物馆 - 行星导航面板 =====
// 左侧行星列表，点击直接飞过去

function setupNavigationPanel() {
    var panel = document.createElement('div');
    panel.id = 'navPanel';
    panel.style.cssText = 'position:fixed;left:16px;top:50%;transform:translateY(-50%);' +
        'z-index:1500;display:flex;flex-direction:column;gap:2px;' +
        'background:rgba(0,10,30,0.65);padding:8px 6px;border-radius:12px;' +
        'border:1px solid rgba(0,200,255,0.12);backdrop-filter:blur(6px);' +
        'max-height:70vh;overflow-y:auto;';

    // 面板标题
    var title = document.createElement('div');
    title.textContent = '🚀';
    title.style.cssText = 'color:#00ddff;font-size:13px;text-align:center;padding:2px 0 4px;' +
        'border-bottom:1px solid rgba(0,200,255,0.1);margin-bottom:3px;cursor:default;';
    title.title = '点击行星导航';
    panel.appendChild(title);

    // 每个行星一行
    SPACEDEMO.planets.forEach(function(p, idx) {
        var row = document.createElement('div');
        row.id = 'nav-' + p.data.name;
        row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:5px 8px;' +
            'border-radius:8px;cursor:pointer;transition:all 0.2s;' +
            'color:#8899aa;font-size:12px;white-space:nowrap;' +
            'border-left:2px solid transparent;';

        // 行星图标
        var icon = document.createElement('span');
        icon.textContent = p.data.icon;
        icon.style.cssText = 'font-size:15px;width:18px;text-align:center;';

        // 行星名称
        var name = document.createElement('span');
        name.textContent = p.data.name;
        name.style.cssText = 'font-size:12px;';

        row.appendChild(icon);
        row.appendChild(name);

        // 悬停效果
        row.onmouseover = function() {
            this.style.background = 'rgba(0,200,255,0.1)';
            this.style.color = '#00ddff';
        };
        row.onmouseout = function() {
            this.style.background = 'transparent';
            if (!this.classList.contains('nav-active')) {
                this.style.color = '#8899aa';
            }
        };

        // 点击导航
        row.onclick = function() {
            // 如果地图模式开着先退出
            if (SPACEDEMO.mapModeActive && typeof exitMapMode === 'function') {
                exitMapMode();
            }
            focusOnPlanet(p);
            highlightNav(p.data.name);
        };

        panel.appendChild(row);
    });

    document.body.appendChild(panel);
}

// 高亮当前选中的行星
function highlightNav(planetName) {
    document.querySelectorAll('[id^="nav-"]').forEach(function(el) {
        el.classList.remove('nav-active');
        el.style.color = '#8899aa';
        el.style.borderLeftColor = 'transparent';
    });
    var active = document.getElementById('nav-' + planetName);
    if (active) {
        active.classList.add('nav-active');
        active.style.color = '#00ddff';
        active.style.borderLeftColor = '#00ddff';
    }
}

// 清除导航高亮（取消聚焦时调用）
function clearNavHighlight() {
    document.querySelectorAll('[id^="nav-"]').forEach(function(el) {
        el.classList.remove('nav-active');
        el.style.color = '#8899aa';
        el.style.borderLeftColor = 'transparent';
    });
}
