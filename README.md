[English](README.en.md) | 中文

# 墨简 Mojian

AI 驱动的中古风简历编辑器。

宣纸、墨砚、印章、窗棂——用中国古典设计元素做简历。内置 AI 润色，Typst 实时渲染，多模板切换。

## 技术栈

- **前端**：React + TypeScript + Vite
- **渲染**：Typst（浏览器端编译，实时预览）
- **AI**：多供应商支持（OpenRouter / 直连），统一 Provider 入口
- **架构**：六层分层（Types → Config → Repo → Service → Runtime → UI），自定义 ESLint 规则强制执行

## 项目结构

```
src/
├── types/          类型定义
├── config/         AI 供应商、模板、主题配置
├── repo/           简历持久化、模板存储
├── service/        AI 服务、Typst 渲染、导出
├── runtime/        状态管理、事件、路由
└── ui/             页面、组件、设计令牌
    ├── tokens/     古风设计令牌
    ├── components/ 原子组件
    ├── patterns/   组合模式
    └── pages/      页面视图

docs/               契约文档（需求、设计、技术决策、执行计划）
.claude/            Harness 框架（Agent 定义、脚本、规则）
```

## 运行

需要 Node.js >= 18。

```bash
git clone https://github.com/Aryous/Mojian.git
cd Mojian
npm install
npm run dev
```

打开 `http://localhost:5173`，在设置中填入 OpenRouter API Key 即可使用 AI 功能。

不配置 API Key 也可以正常编辑和预览简历。

### 其他命令

```bash
npm run build        # 生产构建
npm run lint         # ESLint（含分层规则）
npm test             # 运行测试
```

## Harness

本项目使用 Agent 驱动的工程框架管理开发流程：

- 7 个专职 Agent（需求分析、架构、技术决策、设计、计划、实现、文档修复）
- 管线门禁（每个阶段有准入/准出条件）
- 溯源覆盖率（代码 `@req` 标注追溯到需求）
- 豁免状态机（历史债的受控例外路径）

框架本身已抽象为独立项目：[HarnessPractice](https://github.com/Aryous/HarnessPractice)

## 许可

MIT

