# 页面拆分 + Dashboard 卡片预览设计

> 将落地页与工作台分离，重新设计简历列表为卡片预览 + 腰封信息层。

## 1. 路由架构

| 路由 | 页面 | 职责 |
|---|---|---|
| `/` | LandingPage | 纯落地页：Hero + 功能展示 + CTA → `/new` |
| `/dashboard` | DashboardPage（新） | 简历管理工作台：卡片网格 + 新建入口 |
| `/new` | TemplateSelectPage | 不变 |
| `/editor/:id` | EditorPage | 不变 |

- LandingPage **不加载任何简历数据**，只做品牌展示和转化
- 所有「开始创作」CTA 导向 `/new`
- EditorPage 返回按钮导向 `/dashboard`

## 2. LandingPage 改造

从现有 `HomePage` 剥离：
- **保留**：HeroSection、FeatureShowcase、ink wash divider、footer
- **移除**：`useResumeStore` 引用、gallery section、resume card、loading/empty states
- **重命名**：`HomePage` → `LandingPage`，文件夹 `src/ui/pages/HomePage/` → `src/ui/pages/LandingPage/`

## 3. DashboardPage 布局

### 顶部栏
- 标题「我的简历」（Noto Serif SC, 28px, bold）
- 简历数量角标（`N 份`，caption size，disabled color）
- 无额外按钮——新建入口在网格第一张卡片

### 卡片网格
- 响应式：宽屏（≥768px）3 列，窄屏（<768px）2 列
- gap: 24px（宽屏）/ 16px（窄屏）
- max-width: 1080px，水平居中
- 卡片按 `updatedAt` 降序排列

### 第一张：「+ 新建简历」虚线卡片
- A4 竖版比例（210:297）
- 虚线边框（dashed, rgba(120,100,80,0.25)）
- 居中「+」圆形 icon + "新建简历" 文字
- hover：边框加深、背景加深、translateY(-4px)
- 点击导向 `/new`

### 简历卡片结构
- A4 竖版比例（210:297）
- 白色背景，展示缓存的 SVG 快照
- 圆角 8px，阴影 `0 2px 8px rgba(0,0,0,0.08)`
- hover：translateY(-4px) + 阴影加深
- 右上角：hover 时显示删除按钮（圆形半透明背景，× 图标）

### 腰封（Obi）信息层
- 位置：卡片底部约 15% 处，横贯全宽
- **配色：靛蓝**
  - 背景：藏青渐变 `#2C3548 → #232C3D`，叠加横纹纹理
  - 上下边框：`1.5px solid #3A4560`
  - 文字：`#E8E2D6`
  - 左侧装饰竖线：朱红 `#B8423A`，3px 宽
  - 右侧小印章：「简」字，赭石 `#C4883A`，微微歪斜（rotate -3deg），半透明
- 内容：
  - 标题（Noto Serif SC, 13px, semibold）
  - 模板名 · 填充进度 · 更新时间（10px, 60% opacity）
  - 进度条（2px 高，颜色随完成度变化）
- 阴影：上下各有微妙 box-shadow 制造厚度感
- hover：阴影加深

### 进度条颜色
| 完成度 | 颜色 | 含义 |
|---|---|---|
| ≤40% | `#B8423A` 朱红 | 刚开始 |
| 41-99% | `#E8B86D` 赭石 | 进行中 |
| 100% | `#7DC88B` 青绿 | 已完成 |

### 空状态
- 仅显示「+ 新建简历」虚线卡片
- 下方一行引导文字：「案头空空，不如落笔」

## 4. SVG 快照缓存机制

### 存储
- **位置**：`localStorage`
- **key 格式**：`mojian:preview:{resumeId}`
- **value**：SVG 字符串

### 写入时机
- `previewStore.compile()` 成功后，自动将 SVG 存入缓存
- 即：用户在 EditorPage 或 TemplateSelectPage 触发编译时，副作用写缓存

### 读取时机
- DashboardPage 加载时，对每份简历读 `localStorage` 获取缓存 SVG
- 不触发编译，零网络开销

### 失效
- 删除简历时，同步清除对应缓存 key
- 无需过期机制——缓存永远是最近一次编译的结果

### 无缓存 fallback
- 显示模板对应的静态线框占位图（复用 TemplateThumbnail 组件的 SVG）
- 视觉上与有缓存的卡片保持一致的比例和布局

## 5. 填充进度计算

### 逻辑
检查 Resume 的 5 个板块是否非空：

| 板块 | 判定非空条件 |
|---|---|
| personal | `name` 非空 |
| education | 数组长度 > 0 |
| work | 数组长度 > 0 |
| skills | 数组长度 > 0 |
| projects | 数组长度 > 0 |

### 接口
```typescript
// src/service/resume/progress.ts
interface ResumeProgress {
  filled: number  // 已填写板块数
  total: number   // 总板块数（固定 5）
}

function getResumeProgress(resume: Resume): ResumeProgress
```

### 数据来源
Dashboard 加载的是 `ResumeSummary`（仅 id/title/templateId/timestamps），无法直接计算进度。两种解决方案：

**方案：保存时缓存进度到 localStorage**
- key: `mojian:progress:{resumeId}`，value: `{filled, total}` JSON
- 写入时机：与 SVG 快照相同——`previewStore.compile()` 成功后写入（此时必然有完整 Resume 数据）
- 读取时机：Dashboard 加载时读缓存
- 无缓存 fallback：不显示进度信息

### 展示
- 腰封中显示 `{filled}/{total} 已填写`
- 进度条宽度 = `filled / total * 100%`

## 6. 文件变更清单

### 新建
- `src/ui/pages/DashboardPage/DashboardPage.tsx`
- `src/ui/pages/DashboardPage/DashboardPage.module.css`
- `src/ui/pages/DashboardPage/index.ts`
- `src/service/resume/progress.ts`

### 重命名
- `src/ui/pages/HomePage/` → `src/ui/pages/LandingPage/`
- 内部组件名 `HomePage` → `LandingPage`

### 修改
- `src/App.tsx` — 路由变更（新增 `/dashboard`，`/` 指向 LandingPage）
- `src/ui/pages/LandingPage/LandingPage.tsx` — 移除 `useResumeStore`、gallery、loading/empty
- `src/ui/pages/EditorPage/EditorPage.tsx` — 返回按钮改为 `/dashboard`
- `src/runtime/store/previewStore.ts` — compile 成功后写 localStorage 缓存
- `src/runtime/store/resumeStore.ts` — deleteResume 时清除 localStorage 缓存
- `tests/` — 更新相关测试

### 不变
- `src/ui/pages/TemplateSelectPage/` — 完全不变
- `src/ui/components/HeroSection/` — 完全不变
- `src/ui/components/FeatureShowcase/` — 完全不变

## 7. 设计令牌扩展

腰封用到的新令牌（添加到 `src/ui/tokens/index.css`）：

```css
/* 腰封 (Obi) */
--obi-bg-start: #2C3548;
--obi-bg-end: #232C3D;
--obi-border: #3A4560;
--obi-text: #E8E2D6;
--obi-text-muted: rgba(232, 226, 214, 0.6);
--obi-accent-line: #B8423A;
--obi-seal: #C4883A;
--obi-progress-track: rgba(255, 255, 255, 0.1);
--obi-progress-low: #B8423A;
--obi-progress-mid: #E8B86D;
--obi-progress-done: #7DC88B;
```
