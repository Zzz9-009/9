# 移动端触摸事件 · 课堂实践记录

- 姓名学号：王振旭 24002120207
- 记录时间：2026-11-18
- 使用模型：DeepSeek-V4.1-Flash
- 练习页面：mobile-gesture.html、mobile-zoom.html、mobile-sensor.html
- 运行截图：shots/mobile-gesture.png、shots/mobile-zoom.png、shots/mobile-sensor.png

## 任务一 · 事件侦探

测试方式：在 Edge 中开启触摸模拟（390×844，hasTouch），对课程页第 3 节「事件探针」派发真实 touch 事件，逐条读取探针日志。

| 操作 | 实测事件顺序 |
|---|---|
| 单击 | `touchstart` → `touchend` → `click` |
| 向上拖动 150px（分 10 帧） | `touchstart` → `touchmove` ×9 → `touchend`（没有 click） |
| 向左快速滑 200px（分 5 帧） | `touchstart` → `touchmove` ×5 → `touchend` |
| 双指同时按下再抬起 | `touchstart` ×2 → `touchend` ×2（每根手指各触发一次） |
| 长按 800ms 后抬起 | `touchstart` → `touchend` → `click` |

### 三个验收问题

1. **一次拖动的 `touchmove` 有多少次、和距离什么关系？**
   本次 150px 拖动派发 10 帧，探针记录 9 条 `touchmove`。浏览器按渲染帧合并事件，距离越长、手指移动越慢，帧数越多，触发次数越多；正常使用大约每秒 60 次量级，和"位移/帧间隔"成正比。

2. **`click` 出现在 `touchend` 之前还是之后？**
   之后。先有 `touchstart → touchend`，浏览器再补发一次 `click`；如果位移较大（被判成滑动或滚动），`click` 不会补发。

3. **把 `touchend` 换成 `touchcancel` 会怎样？**
   正常抬手只会触发 `touchend`，换成 `touchcancel` 后就收不到抬手事件：拖动状态、长按定时器、锁定标记都不会复位，下一次触摸会沿用上一次的起点，表现为"卡住"或"跳一下"。`touchcancel` 只在系统打断（来电、通知、手势返回）时触发，它应该和 `touchend` 一起用来做清理。

## 遇到的一个坑

放大状态下的双击没有反应。原因：`touchstart` 时因为 `scale > 1` 进入了拖动分支，`touchend` 里直接按拖动收尾，根本没有走双击计时的逻辑。

解决：在拖动分支的 `touchend` 里加判断——如果本次没有产生超过 8px 的位移，就当成一次点击，接入同一个双击计时器（300ms 内第二次点击即切换 1x / 2x）。改完后双击在 1x 和 2x 之间都能正常切换。

## 任务四 · 传感器（A 摇一摇 + B 倾斜视差）

两个方案都做在 `mobile-sensor.html` 里，用顶部标签切换：

- **A 摇一摇**：`devicemotion` 取 `accelerationIncludingGravity` 算合成加速度，超过 18 判定为摇动，触发后 1.5 秒冷却；iOS 先点按钮申请权限；收不到数据时显示提示，并保留「点我抽一次」降级按钮。
- **B 倾斜视差**：`deviceorientation` 读 `beta`（前后）与 `gamma`（左右），先限制到 ±25°，再按每层 `data-wzx-depth` 换算位移：前景层正向移动、背景层用负值反向移动，形成纵深。同样有 iOS 权限按钮与无数据提示。

自动化验证：倾斜 11 项断言全部通过（读数联动、前景位移 12.96px 与背景 −14.4px 反向、超范围被限制、切换后状态不丢失、无数据 3 秒后提示）；摇一摇与手势、缩放共 23 项断言回归通过。

## 命名说明

课堂模板里的前缀是 `wy_`，按"以自己命名规则替换"的要求，本作业统一使用 `wzx_`。

## 本次使用的 AI 提示词（摘要）

```
按课堂页 mobile-events-lesson 的 4 个实践任务完成作业：
1. 任务一用真实触摸事件观察 touchstart/touchmove/touchend/click 的顺序并记录；
2. 新建 mobile-gesture.html：4 道美食卡片，左右滑动切换，阈值 40px，
   边界提示"已经是第一张/最后一张"，0.3s 过渡，300ms 冷却，容器 touch-action: pan-y；
3. 新建 mobile-zoom.html：双指缩放 1x-4x、以两指中点为基准、双击 1x/2x 切换、
   放大后单指拖动并限制边界、旋转屏幕不丢状态，说明如何保证缩放不跳；
4. 新建 mobile-sensor.html：devicemotion 摇一摇抽菜谱，阈值 18，1.5s 冷却，
   iOS 权限申请，无传感器时降级为手动抽取；
5. 类名、id、JS 变量统一 wzx_ 前缀，文件头写姓名学号，每个函数加功能注释。
验证要求：用浏览器触摸模拟实测每个验收点，输出通过/失败清单。
```
