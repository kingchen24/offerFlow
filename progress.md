# OfferFlow 开发日志

> 会话日志和进度记录

---

## 会话 1：项目初始化

**时间**：2026-05-10

**内容**：
- Vite + React 19 + Tailwind CSS v4 项目脚手架搭建
- AppContext 全局状态层（jobs/resumes/tasks/reviews 四实体 + localStorage 持久化）
- ThemeContext 深色/浅色模式切换
- App.jsx 主容器 + SplashScreen 入场动画
- Navbar / Sidebar / BottomNav 三端导航布局
- mockData 模拟数据生成器

**产出**：基础架构搭建完成，导航系统就绪

---

## 会话 2：8 页面开发

**时间**：2026-05-11

**内容**：
- 全部 8 个页面开发：Dashboard / Board / Positions / Resumes / Schedule / Interview / Insights / Settings
- Board 看板 HTML5 Drag & Drop（10 列状态）
- Recharts 图表面板（漏斗图、柱状图）
- 模拟数据：14 岗位、5 简历、11 任务、7 复盘

**产出**：全部页面功能就绪

---

## 会话 3：弹窗系统

**时间**：2026-05-11

**内容**：
- 所有 CRUD Modal 开发：JobModal / JobDetailModal / TaskModal / ReviewModal / ReviewDetailModal / ResumeModal / ResumePreviewModal
- ConfirmDialog 确认删除弹窗
- Toast 消息通知系统

**产出**：弹窗系统完整可用

---

## 会话 4：主题系统

**时间**：2026-05-11

**内容**：
- index.css 全面重构，30+ 语义化 CSS 自定义属性
- :root / .dark 双主题体系
- 环境光晕、渐变边框、暗色滚动条
- 浅色渐变纹理背景

**产出**：完整的深色/浅色主题系统

---

## 会话 5：SplashScreen + GlowCard

**时间**：2026-05-12

**内容**：
- SplashScreen 视觉增强（Playfair Display 字体、背景图、3 阶段入场动效）
- Splash 主题切换闪退 Bug 修复（exitClassRef）
- GlowCard 鼠标跟随光效组件
- 独立引导页 splash.html

**产出**：Splash 视觉品质提升，GlowCard 光效系统

---

## 会话 6：Sidebar 重构

**时间**：2026-05-13 ~ 2026-05-17

**内容**：
- Sidebar B 端 SaaS 风格全面重构
- 深色/浅色模式验收修复（oklch 色彩空间）
- Sidebar 尺寸两轮放大（280px → 300px）
- 浅色模式玻璃态面板修复

**产出**：Sidebar B 端风格确定

---

## 会话 7：弹窗系统收尾

**时间**：2026-05-14 ~ 2026-05-15

**内容**：
- ModalHeader 组件提取与全模块覆盖
- GlowCard 覆盖全部弹窗 + 表单模式 handleFocusIn
- SplashScreen 浅色模式退出动画修复
- Insights 面板 InterviewDetailModal 弱光效变体

**产出**：弹窗系统统一收尾

---

## 会话 11（当前）：ReviewDetailModal 黑屏崩溃修复

**时间**：2026-05-18

**内容**：
- ReviewDetailModal 黑屏崩溃修复：
  - 新增 `normalizeAttachments()` 防御性函数，`Array.isArray` 检查所有数组字段
  - 修复 `renderStars(review.rating)` → `renderStars(liveReview.rating)`
  - 移除复杂的内联 Preview Overlay（~70 行 + 5 状态变量 + 2 useEffect）
  - 替换为轻量级 `handleOpenAttachment`：图片/PDF 新标签页，其他文件下载
  - 移除 `useRef` 等不再需要的状态

**产出**：黑屏崩溃修复，附件预览重构

---

## 会话 12：面试复盘附件持久化全链路修复

**时间**：2026-05-18

**内容**：
- `reviewAttachmentStore.js` 全面重写：
  - `db.close()` 在 `tx.oncomplete` 和 `tx.onerror` 中关闭连接
  - 数据库名改为 `offerflow-review-attachments`
  - `getReviewAttachment` 直接返回 blob
- `AppContext.jsx` 修复：
  - `addReview`：防御传入 `id` 和 `attachments`
  - `updateReview`：仅当 `patch.attachments` 为数组时才替换
- `ReviewModal.jsx` 修复：
  - `selectedFile` → `selectedFiles`（多文件支持）
  - `handleFileChange` 支持多文件选择
  - `addAttachment` 批量遍历写入 IndexedDB
  - `handleSave` 函数顶部统一确定 reviewId
- `ReviewDetailModal.jsx` 同步 `getReviewAttachment` 接口变更

**产出**：附件持久化全链路修复，多文件上传支持

---

## 会话 8（当前）：规划系统接入

**时间**：2026-05-17

**内容**：
- 发现并接入 planning-with-files-zh 技能
- 创建 task_plan.md / findings.md / progress.md
- 回溯记录已完成的工作
- 确立后续迭代计划

**下一阶段**：
- 按 task_plan.md 阶段 9 中优先级推进新功能
- 每个阶段完成后更新规划文件
- 新 Bug/优化项记入 task_plan.md

---

## 会话 9：简历文件 IndexedDB 持久化

**时间**：2026-05-17

**内容**：
- 新建 `src/utils/resumeFileStore.js` — IndexedDB 封装（saveResumeFile / getResumeFile / deleteResumeFile / createObjectUrl）
- 重写 ResumeModal.jsx 文件上传逻辑：
  - 新增文件类型校验（PDF/DOC/DOCX）和 10MB 大小限制
  - handleSave 异步写入 IndexedDB，编辑模式保留原文件字段
  - 使用 key 强制重挂载替代 useEffect 表单初始化，消除 ESLint react-hooks/set-state-in-effect
- 重写 ResumePreviewModal.jsx：
  - 从 IndexedDB 读取 Blob 并使用 URL.createObjectURL 预览/下载
  - PDF 使用 iframe 预览，DOC/DOCX 提供下载按钮
  - 组件卸载时 revokeObjectURL 防止内存泄漏
  - 文件丢失时显示"文件已丢失，请重新上传"
- 修改 Resumes.jsx：删除简历时异步清理 IndexedDB 文件，真实文件下载功能
- 更新 mockData.js：为所有 mock 简历添加 hasFile/fileName/mimeType 字段
- 更新技术文档：改动日志、数据模型、目录结构、持久化策略
- npm run build 通过，ESLint 通过（0 错误在修改文件中）

**验收**：
- 新增简历 + 上传文件 → IndexedDB 保存 → 刷新后仍可预览/下载 ✓
- 编辑简历名称但不重新上传 → 原文件保留 ✓
- 编辑简历 + 重新上传 → 旧文件被替换 ✓
- 删除简历 → IndexedDB 中文件被异步删除 ✓
- localStorage 中无 base64 文件内容 ✓
- File 对象不保存在 localStorage ✓

---

## 会话 10：简历文件持久化链路审计与修复

**时间**：2026-05-17

**审计项目**：

| 检查点 | 状态 | 修复 |
|--------|------|------|
| 1. resumeId 一致性 — saveResumeFile 和 setResumes 使用相同 ID | ✅ 无误 | 无需修改 |
| 2. updateResume 覆盖文件字段 — 编辑时显式保留六字段 | ⚠️ 隐性依赖 spread | 改为显式从 `resume` 拷贝 `hasFile/fileName/mimeType/fileSize/format/fileUrl` |
| 3. IndexedDB 写入确认 — await + catch + 错误 Toast | ✅ 无误 | 增加 `saving` 状态防止重复提交 |
| 4. 读取 key — 直接使用 resume.id | ✅ 无误 | 增加日志追踪读取链路 |
| 5. 删除逻辑 — deleteResumeFile 仅在删除简历时调用 | ✅ 无误 | 无需修改 |
| 6. 浏览器兼容性 | ⚠️ 缺少边界处理 | 增加 `window.indexedDB` 存在性检查 |

**主要修复**：
1. 新增 `saving` 状态（防重复提交），保存按钮在保存期间 disabled+显示"保存中..."
2. 编辑模式下 CASE 2 显式从 `resume` 拷贝全部文件字段（不再依赖 form spread）
3. 所有 IndexedDB 操作增加完整的 `onerror` 日志
4. openDB 增加 `window.indexedDB` 存在性检查
5. ResumePreviewModal 增加文件加载日志

**运行确认**：
- 打开 DevTools → Application → IndexedDB → OfferFlowDB → resume-files
- 上传后检查 key=resume.id 的 Blob 记录
- Application → Local Storage → offerFlow_resumes 确认 hasFile=true
