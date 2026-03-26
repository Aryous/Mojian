# 系统信息流

> 墨简项目的完整信息流图。所有元素、链接、触发条件的权威参考。

---

## 全局视图

```
                         ┌──────────────┐
                         │     人 类     │
                         │  (意图+裁决)  │
                         └──┬───┬───┬───┘
                  ① 意图输入 │   │   ↑
                            ↓   │   │ ④ 上报
                    ┌────────────┐   │
                    │ intent.md  │   │
                    │ (只读)     │   │
                    └─────┬──────┘   │
                     ② 读取          │
                          ↓          │
                  ┌───────────────┐  │
                  │  req-review   │──┘
                  │   agent       │
                  └───────┬───────┘
                     ③ 产出│status: review
                          ↓
                  ┌────────────────┐     ⑤ 裁决回注
           ┌──────│requirements.md │←─── 人类审批 → status: approved
           │      └────────┬───────┘
           │          ② 读取│(需 approved)
           │               ↓
           │      ┌───────────────┐
           │      │ tech-selection│──→ ④ 上报（技术决策中的非技术问题）
           │      │    agent      │
           │      └───────┬───────┘
           │         ③ 产出│status: review
           │               ↓
           │      ┌─────────────────┐
           │ ┌────│tech-decisions.md│←── 人类审批 → status: approved
           │ │    └────────┬────────┘
           │ │             │
           │ │             ↓
           │ │    ┌─────────────────┐
           │ │    │   阶段 3：环境    │  ← 不是 Agent，是基础设施
           │ │    │  · lint 规则     │
           │ │    │  · CI 流水线     │
           │ │    │  · 结构测试      │
           │ │    └────────┬────────┘
           │ │             │
           │ │    ┌────────┴────────┐
           │ │    ↓                 ↓
           │ │  ┌──────┐      ┌─────────┐
           │ │  │design│      │ feature │
           │ │  │agent │      │  agent  │
           │ │  └──┬───┘      └────┬────┘
           │ │     │               │
           │ │     ↓               ↓
           │ │  src/ui/         src/
           │ │     │               │
           │ │     └───────┬───────┘
           │ │             ↓
           │ │    ┌─────────────────┐
           │ │    │    Lint / CI    │  ⑦ 环境反馈
           │ │    │  (每次提交自动)  │──→ 报错含修复指令 → Agent 修正
           │ │    └─────────────────┘
           │ │
           │ │    ┌─────────────────┐
           │ └───→│  doc-gardening  │  持续运行
           └─────→│     agent       │──→ 扫描漂移 → 修复文档
                  └─────────────────┘
```

---

## 链接清单

| 编号 | 名称 | 起点 | 终点 | 机制 | 协议文件 |
|---|---|---|---|---|---|
| ① | 意图输入 | 人类 | intent.md | 人类直接编写 | — |
| ② | Agent 读取 | 文档 | Agent | Agent 启动前检查 frontmatter status | protocols.md |
| ③ | Agent 产出 | Agent | 文档 | 输出带 status: review 的 frontmatter | protocols.md |
| ④ | 上报 | Agent | 人类 | "待人类裁决"章节（选项+影响+阻塞） | protocols.md |
| ⑤ | 裁决回注 | 人类 | 文档 | 裁决写回文档 + status 改为 approved | protocols.md |
| ⑥ | 交接触发 | Agent A 输出 | Agent B 启动 | 下游检查上游 status == approved | protocols.md |
| ⑦ | 环境反馈 | Lint/CI | Agent | 报错信息含修复指令 | ARCHITECTURE.md |

---

## 阶段与信息流的对应

| 阶段 | 输入 | 执行者 | 输出 | 下游消费者 |
|---|---|---|---|---|
| 0 意图 | 人类想法 | 人类 | intent.md | req-review |
| 1 需求 | intent.md (approved) | req-review agent | requirements.md (review) | 人类审批 → tech-selection |
| 2 选型 | requirements.md (approved) | tech-selection agent | tech-decisions.md (review) | 人类审批 → 阶段 3 |
| 3 环境 | tech-decisions.md (approved) | 基础设施搭建 | eslint.config.js, CI, tests | 所有后续 Agent |
| 4 开发 | exec-plan + 约束环境 | design / feature agent | src/ + 文档 | Lint/CI → 用户 |
| 持续 | 全库 | doc-gardening agent | 文档修复 + 质量评分 | 所有 Agent + 人类 |

---

## 外部系统边界

```
┌─────────────────────────────────────────────┐
│               墨简系统边界                    │
│                                             │
│  src/ ←→ Typst WASM（渲染）                  │
│  src/service/ai/ ←→ OpenRouter API（AI 服务） │
│  .github/workflows/ ←→ GitHub Actions（CI）  │
│  src/ui/ ←→ 浏览器（用户界面）                │
│                                             │
└─────────────────────────────────────────────┘
```

这些外部系统是信息流的输入/输出边界，接口定义见 `docs/references/`。
