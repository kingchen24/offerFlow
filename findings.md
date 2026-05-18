# OfferFlow 研究发现

> 项目开发过程中的关键技术发现、决策背景和解决方案

---

## CSS 与主题系统

### oklch() 色彩空间

- **发现**：Tailwind CSS v4 和现代浏览器广泛支持 `oklch()` 色彩空间，比 `hsl()`/`rgb()` 更感知均匀
- **应用**：浅色模式 Sidebar 选中态使用 `oklch(0.21 0.04 278)` 紫色体系，确保跨屏颜色一致
- **注意**：oklch 的浏览器支持需 Chrome 111+ / Firefox 113+ / Safari 15.4+

### 暗色模式光效

- **GlowCard 实现**：通过 CSS 自定义属性 `--mouse-x`/`--mouse-y` 实时跟踪鼠标位置，`radial-gradient` 实现聚光灯效果
- **表单模式**：`handleFocusIn` 回调将光晕中心移至聚焦输入框，提升表单使用体验
- **多变体**：支持 Default / Danger / Success / Data-weak 四种光效强度变体

### ::before fill 渐变边框

- `.modal-panel` 使用 `::before` + `mask` 实现渐变边框，避免 `border-image` 导致的圆角/内容覆盖问题
- 关键在于 `padding: 1px` + `mask: composite` 方案

---

## React 经验

### useRef 冻结动画类名

- **问题**：React StrictMode 和主题切换（`isDark` 变化）会导致 SplashScreen 退出动画重播
- **方案**：`exitClassRef = useRef()` 在首次进入时冻结退出类名，后续 `isDark` 变化不再更新 ref
- **教训**：条件渲染中的动画逻辑需要考虑 React 重渲染对动画类名的影响

### Context + useCallback 性能

- 使用 `useCallback` 包裹状态更新函数，减少不必要的子组件重渲染
- `setXxx((prev) => ...)` 函数式更新确保数据一致性
- localStorage 同步在 setter 内部完成，对组件透明

### crypto.randomUUID()

- 现代浏览器原生支持 `crypto.randomUUID()` 生成 UUID，无需 uuid 库依赖
- 适用于所有 CRUD 操作的 ID 生成

---

## 工具与库

### Recharts v3.8.1

- React-native 声明式图表 API，适合简单的数据可视化
- 组合模式：`<ResponsiveContainer> → <BarChart> → <Bar> / <XAxis> / <Tooltip>`
- 自定义颜色通过 `fill` prop 或 `<Cell fill={...}>` 实现

### Tailwind CSS v4 变化

- CSS-first 配置（`@import "tailwindcss"` 替代 `@tailwind` 指令）
- `@theme` 指令定义设计 Token
- `@tailwindcss/vite` 插件（PostCSS 插件可选）

---

## 项目当前状态

截至 2026-05-17，项目已完成全部 8 个页面的核心功能：
- 5101 行有效代码（19 个文件）
- 4 个数据实体（jobs/resumes/tasks/reviews）完整 CRUD
- 深色/浅色完整主题系统
- localStorage 持久化
- Recharts 数据可视化
- GlowCard 暗色光效系统
- SplashScreen 入场/出场动画

---

## 附件持久化与黑屏修复（2026-05-18）

### 黑屏崩溃根因

1. **非数组 `map()` 崩溃**：`liveReview.attachments || []` 仅捕获 `null/undefined`，遗留数据中 attachments 为字符串/非数组时 `attachments.map()` 抛出 `TypeError`。修复：`Array.isArray()` 全量防御
2. **prop 与 state 不同步**：`renderStars(review.rating)` 使用 prop 而非 `liveReview`，删除/编辑后评分区域可能异常
3. **复杂 Preview Overlay**：5 个状态变量 + 2 个 cleanup useEffect 管理内联预览，耦合度高、容易泄漏

### IndexedDB 连接管理

- **问题**：`openDB()` 每次调用都会打开新连接，`oncomplete` 中未 `db.close()` 导致连接泄漏。长期运行的连接可能导致后续操作竞争条件
- **修复**：所有 Promise 的 resolve 和 reject 路径都增加 `db.close()`

### AppContext 数据安全

- **`updateReview` 覆盖陷阱**：`{ ...r, ...patch }` 中如果 `patch` 不包含 `attachments` 字段，不会覆盖（spread 只覆盖存在的 key）。但关键问题是在 `ReviewModal.handleSave` 中，`data` 始终包含 `attachments` 状态，即使是空数组。所以当编辑模式下没有附件时，`attachments: []` 会被写入，覆盖原有附件
- **修复策略**：`updateReview` 仅当 `Array.isArray(patch.attachments)` 时才替换 `attachments`，否则保留 `r.attachments || []`

### reviewId 一致性

- **关键约束**：IndexedDB 的 key 为 `${reviewId}:${attachmentId}`，review 元数据的 `id` 必须等于 `reviewId`。如果保存时和读取时使用的 reviewId 不同，附件就找不到
- **修复**：`handleSave` 函数顶部统一确定 `reviewId = isEdit ? review.id : (pendingReviewId || crypto.randomUUID())`，后续所有 IndexedDB 操作和 state 更新都使用这个值

### 文件上传

- 单文件 `selectedFile` 改为数组 `selectedFiles`，input 加 `multiple` 属性
- `addAttachment` 遍历所有文件逐一写入 IndexedDB，批量添加元数据
- 错误处理：单个文件失败不影响其他文件，每个失败文件单独 Toast 提示
