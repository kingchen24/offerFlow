# OfferFlow 开发计划

> 项目：求职全流程管理工具
> 技术栈：React 19 + Vite 8 + Tailwind CSS v4 + Recharts
> 状态：核心功能已完成，进入迭代优化阶段

---

## 目标

为求职者提供一个端到端的求职管理平台，覆盖岗位收集→投递→面试→复盘→决策全链路。

---

## 阶段总览

| 阶段 | 名称 | 状态 | 完成日期 |
|------|------|------|----------|
| 1 | 项目脚手架与基础架构 | ✅ 完成 | 2026-05-10 |
| 2 | 导航系统与布局 | ✅ 完成 | 2026-05-11 |
| 3 | 核心页面与模拟数据 | ✅ 完成 | 2026-05-11 |
| 4 | 弹窗系统与 Toast 通知 | ✅ 完成 | 2026-05-11 |
| 5 | CSS 主题系统与暗色光效 | ✅ 完成 | 2026-05-12 |
| 6 | SplashScreen 增强与 GlowCard | ✅ 完成 | 2026-05-12 |
| 7 | Sidebar B 端 SaaS 风格迭代 | ✅ 完成 | 2026-05-13 ~ 2026-05-17 |
| 8 | 弹窗系统全模块覆盖 | ✅ 完成 | 2026-05-14 ~ 2026-05-15 |
| 9 | 后续迭代与优化 | ⏳ 进行中 | — |

---

## 阶段 1：项目脚手架与基础架构 ✅

**目标**：Vite + React 19 + Tailwind CSS v4 项目初始化，全局状态管理

- [x] Vite 项目初始化 (React + SWC)
- [x] Tailwind CSS v4 + `@tailwindcss/vite` 插件
- [x] `AppContext.jsx` — 全局数据层（jobs/resumes/tasks/reviews 四实体）
- [x] `ThemeContext.jsx` — 深色/浅色主题切换
- [x] localStorage 自动持久化
- [x] ESLint flat config

**创建的文件**：
- `package.json`, `vite.config.js`, `eslint.config.js`, `index.html`
- `src/main.jsx`, `src/App.jsx`, `src/index.css`
- `src/store/AppContext.jsx`, `src/store/ThemeContext.jsx`, `src/store/mockData.js`

---

## 阶段 2：导航系统与布局 ✅

**目标**：Navbar / Sidebar / BottomNav 三端适配导航布局

- [x] Navbar（顶部导航：标题、搜索、主题切换、头像）
- [x] Sidebar（桌面侧边栏，8 个菜单项，紫色选中态）
- [x] BottomNav（移动端底部导航，5 项核心入口）
- [x] App.jsx 主容器（SplashScreen + entered 入场动画）

**创建的文件**：
- `src/components/Navbar.jsx`, `src/components/Sidebar.jsx`, `src/components/BottomNav.jsx`
- `src/components/SplashScreen.jsx`

---

## 阶段 3：核心页面与模拟数据 ✅

**目标**：全部 8 个页面的基础功能与模拟数据

- [x] Dashboard — 概览指标面板（统计卡片 + 时间线 + 任务）
- [x] Board — 10 列 Kanban 看板（HTML5 Drag & Drop 拖拽）
- [x] Positions — 表格列表 + 筛选/搜索
- [x] Resumes — 简历卡片 + 版本管理 + 效果统计
- [x] Schedule — 6 类任务日程（分组 + 完成标记）
- [x] Interview — 8 维度面试复盘 + 评分系统
- [x] Insights — Recharts 图表面板 + 漏斗分析 + 时间筛选
- [x] Settings — 用户设置页
- [x] mockData 模拟数据（14 岗位、5 简历、11 任务、7 复盘）

**创建的文件**：
- `src/pages/Dashboard.jsx`, `src/pages/Board.jsx`, `src/pages/Positions.jsx`
- `src/pages/Resumes.jsx`, `src/pages/Schedule.jsx`, `src/pages/Interview.jsx`
- `src/pages/Insights.jsx`, `src/pages/Settings.jsx`

---

## 阶段 4：弹窗系统与 Toast 通知 ✅

**目标**：岗位/任务/复盘的 CRUD 弹窗与全局消息反馈

- [x] JobModal — 岗位编辑表单
- [x] JobDetailModal — 岗位详情（含时间线）
- [x] TaskModal — 任务编辑
- [x] ReviewModal — 复盘编辑（最长表单：8 维度评分 + 题目 + 改进计划）
- [x] ReviewDetailModal — 复盘详情 + 附件预览
- [x] ResumeModal — 简历编辑
- [x] ResumePreviewModal — 简历预览
- [x] ConfirmDialog — 确认删除弹窗
- [x] Toast — 自动消失的消息通知

**创建的文件**：
- `src/components/JobModal.jsx`, `src/components/JobDetailModal.jsx`
- `src/components/TaskModal.jsx`, `src/components/ReviewModal.jsx`
- `src/components/ReviewDetailModal.jsx`
- `src/components/ResumeModal.jsx`, `src/components/ResumePreviewModal.jsx`
- `src/components/ConfirmDialog.jsx`, `src/components/Toast.jsx`

---

## 阶段 5：CSS 主题系统与暗色光效 ✅

**目标**：建立完整主题系统，提升暗色模式视觉品质

- [x] 30+ 语义化 CSS 自定义属性（`:root` + `.dark` 双体系）
- [x] `.modal-panel` 渐变边框（`::before` fill 方案）
- [x] `.app-glow-tl` / `.app-glow-br` 环境光晕
- [x] 暗色模式 scrollbar、focus-ring、card-glow
- [x] `.light-ambient-container` 浅色渐变纹理

**修改的文件**：
- `src/index.css` — 全面重写主题系统

---

## 阶段 6：SplashScreen 增强与 GlowCard ✅

**目标**：优化 Splash 视觉体验，增加 GlowCard 光效组件

- [x] Playfair Display 字体、背景图、渐变遮罩
- [x] staggered 入场动效（3 阶段 fade-in）
- [x] Splash 主题切换闪退 Bug 修复（`exitClassRef`）
- [x] GlowCard 鼠标跟随光效（`--mouse-x`/`--mouse-y`）
- [x] 独立引导页 `splash.html`

**创建/修改的文件**：
- `src/components/SplashScreen.jsx` — 重构
- `src/components/GlowCard.jsx` — 新建
- `splash.html`, `public/images/offerflow-bg.jpg` — 新建

---

## 阶段 7：Sidebar B 端 SaaS 风格迭代 ✅

**目标**：侧边导航栏 B 端 SaaS 风格改造 + 尺寸放大

- [x] 第一轮重构：宽度、图标、文字全量放大
- [x] 第二轮重构：再次放大（300px）
- [x] 深色/浅色模式 UI/UX 验收修复
- [x] 浅色模式玻璃态面板修复（`oklch()` 色彩空间）

**修改的文件**：
- `src/components/Sidebar.jsx` — 多次迭代

---

## 阶段 8：弹窗系统全模块覆盖 ✅

**目标**：GlowCard 覆盖全部弹窗，ModalHeader 组件提取

- [x] ModalHeader 组件提取与全模块应用
- [x] GlowCard 覆盖 ResumeModal / ResumePreviewModal / TaskModal / ReviewModal / ReviewDetailModal
- [x] GlowCard `handleFocusIn` 表单模式
- [x] Insights InterviewDetailModal 弱光效变体

**创建/修改的文件**：
- `src/components/ModalHeader.jsx` — 新建
- 所有弹窗文件 — GlowCard 包裹

---

## 阶段 9：后续迭代与优化 ⏳

**目标**：新增功能、Bug 修复、体验优化

### 待办功能（按优先级排序）
- [x] 简历文件 IndexedDB 持久化（修复上传刷新丢失、编辑覆盖问题）
- [x] ReviewDetailModal 黑屏崩溃修复（防御性渲染 + 附件预览重构）
- [x] 面试复盘附件持久化全链路修复（IndexedDB 连接管理 + AppContext 数据安全 + ReviewModal 保存链路）
- [ ] 岗位详情页增强（含面试轮次进度条）
- [ ] 数据导出（JSON / CSV）
- [ ] 搜索功能对接（Navbar 搜索框）
- [ ] 求职漏斗图优化（Dashboard 转化率可视化）
- [ ] 数据导入（从招聘平台）
- [ ] AI 面试模拟
- [ ] 求职报告生成（PDF）
- [ ] 多语言支持（中/英切换）
- [ ] 云端同步（账号 + 数据库）
- [ ] 移动端 App（React Native）
- [ ] 团队协作/分享

### 已知优化点
- [ ] 浅色模式某些页面颜色一致性检查
- [ ] Schedule 页面试日历视图（月视图/周视图）
- [ ] Board 看板性能优化（大量卡片时）
- [ ] 移动端布局细节适配
- [x] 简历文件 IndexedDB 持久化审计修复（防重复提交、显式保留文件字段、运行时日志）

---

## 遇到的错误

| 错误 | 尝试次数 | 解决方案 |
|------|---------|---------|
| Light→Dark 切换时 SplashScreen 闪现 | 1 | `exitClassRef` useRef 冻结动画类名 |
| 浅色模式 Splash 退出不够丝滑 | 1 | transition 从条件分支内移出到容器层 |
| Sidebar 浅色模式颜色被整体改为深色 | 1 | 使用 oklch() 色彩空间 + 玻璃态面板 |
| 浅色模式 Sidebar 选中态颜色偏差 | 1 | 统一使用 `oklch(0.21 0.04 278)` 紫色体系 |

## 关键决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| CSS 方案 | Tailwind CSS v4 | 零运行时、CSS-first 配置、`@theme` 指令原生支持设计 Token |
| 状态管理 | Context + useCallback | 仅有 4 个实体（jobs/resumes/tasks/reviews），Context 足够 |
| 构建工具 | Vite | 原生 ESM 支持、Rollup-based 构建 |
| 路由方案 | 条件渲染（activePage） | SPA 单页应用，8 个页面通过 state 切换 |
| 持久化 | localStorage | 数据结构小（KB 级），无需异步操作 |
