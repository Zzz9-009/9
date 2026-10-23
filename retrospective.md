# 移动端固定底部导航 — 项目复盘（retrospective）

| 字段 | 值 |
|------|----|
| **项目** | 移动端固定底部导航（字体图标 / SVG 双版本） |
| **完成日期** | 2026-10-23 |
| **交付文件** | `iconfont-3.html`、`iconfont-4.html`、`index.html`（新增入口） |
| **需求文档** | `spec.md`（已签字确认） |
| **旧文档归档** | `spec-ball-game.md`、`retrospective-ball-game.md` |

---

## 1. 项目目标回顾

用 `font/` 目录中的同一套 iconfont 资源，完成两个移动端页面：

1. 固定在屏幕底部、宽度自适应的 4 项导航；
2. `iconfont-3.html` 使用字体图标，`iconfont-4.html` 使用 SVG symbol；
3. 导航项右上角带数字徽章，购物车额外带红点；
4. 点击切换激活态、内容面板与徽章清除；
5. 保持原生 HTML/CSS/JS、零 CDN、零外部依赖。

以上目标全部完成并通过人工验收。

---

## 2. 阶段执行回顾

| 阶段 | 内容 | 结果 |
|------|------|------|
| Phase 1 | 需求研讨、输出 `spec.md` | 用户确认导航项、徽章分配、视觉方向与交互深度 |
| Phase 2 | 任务拆解 T1–T5 | 用户确认清单 |
| T1 | 页面骨架、静态视觉、固定导航 | 通过 |
| T2 | 4 个数字徽章、购物车红点、99+ 规则 | 通过 |
| T3 | 激活切换、面板淡入、徽章清除、键盘操作 | 通过 |
| T4 | SVG symbol 版本、硬编码 fill 处理 | 通过 |
| T5 | 窄屏/安全区/焦点/降级动效收口、首页入口 | 通过 |

每个任务均执行：人工验收清单 → 编码 → 代码评审报告 → 用户浏览器验证。

---

## 3. 关键技术决策

### 3.1 同一套图标、两种渲染

- 字体版：`font/iconfont.css` + `.iconfont.icon-xxx`，颜色直接由 `color` 控制。
- SVG 版：`font/iconfont.js` + `<use xlink:href="#icon-xxx">`，通过 `fill: currentColor` 继承颜色。

### 3.2 处理 symbol 的硬编码 fill

`icon-shipin`、`icon-xiaoren` 等 symbol 的 `path` 自带 `fill`，会阻断激活色。SVG 页面在 `DOMContentLoaded` 后仅移除本页 symbol 内 `path[fill]` 属性，不修改 `font/iconfont.js`，避免影响 `4.html`、`9.html`。

### 3.3 固定导航的自适应

- 导航 `position: fixed`，`max-width: 520px`，左右自动居中；
- 4 项 `flex: 1 1 0` 等分，窄屏自动收缩；
- `padding-bottom: env(safe-area-inset-bottom)` 兼容刘海屏；
- 内容区按导航高度 + 安全区预留底部空白。

### 3.4 徽章与红点

- 数字徽章绝对定位在图标右上角，`99+` 按内容自然加宽；
- 红点独立定位在徽章右上方，不参与数字徽章布局，两者不重叠；
- 清除时使用 200ms 缩放淡出，结束后设置 `hidden`。

---

## 4. 评审中发现并修复的问题

| 问题 | 影响 | 处理 |
|------|------|------|
| 徽章最初放在 `aria-hidden="true"` 容器内 | `aria-label` 不会被读屏播报 | 将 `aria-hidden` 下移到 `<i>` / `<svg>` 图标本身 |
| `.wzx_nav-badge` 的 `display:inline-flex` 覆盖浏览器 `[hidden]` 默认样式 | 徽章清除后可能仍然可见 | 补充 `.wzx_nav-badge[hidden]`、`.wzx_nav-dot[hidden] { display:none }` |
| 激活函数中存在重复的激活态赋值 | 冗余代码 | 删除无效分支，保留单一职责流程 |
| 行内图标未带 `aria-hidden` 写法被批量替换遗漏 | 12 个行图标短暂保留字体图标 | 逐类检索并补齐替换，最终确认页面无 `iconfont icon-*` 残留 |

---

## 5. 验收结论

`spec.md` 第 10 节的 A-1 至 A-13 全部满足：

- 两页可离线直接打开，控制台无资源与脚本错误；
- 320 / 375 / 414 / 768px 均无横向溢出，4 项等分；
- 固定贴底、安全区生效、内容不被遮挡；
- 数字徽章、`99+`、红点位置正确；
- 点击、键盘、读屏状态与减少动效均符合预期；
- 首页“02 · 字体图标”模块已加入两个入口。

---

## 6. 经验与改进

1. **图标资源先审查再编码**：symbol 自带 `fill` 是 SVG 图标着色的高频坑，提前检查可减少返工。
2. **可访问性属性要放在正确的层级**：`aria-hidden` 放在容器上会连带吞掉徽章的 `aria-label`，应只隐藏装饰性图标。
3. **`hidden` 属性不是万能的**：作者样式中的 `display` 会覆盖浏览器默认隐藏规则，需要显式补 `[hidden]` 规则。
4. **批量替换要二次检索**：相似但不同的标签写法（是否带 `aria-hidden`）会导致漏替，替换后应使用搜索确认零残留。
5. **双版本页面复用同一套 CSS/JS**：仅替换图标节点，能显著降低两页行为漂移的风险。

---

## 7. 后续建议

- 若继续扩展，可把两页共用的导航样式与脚本抽为 `iconfont-nav.css` / `iconfont-nav.js`，减少重复。
- 如需真实业务，可把徽章数量改为数据驱动，并在切换后写入 `localStorage`。
- 新增图标时同步更新 `font/iconfont.css`、`font/iconfont.js` 与本页 symbol 引用，避免 ID 不一致。
