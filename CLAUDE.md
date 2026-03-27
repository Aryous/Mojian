# 墨简 (Mojian) — Agent 地图

> Agent 看不到的知识不存在——所有决策必须落库。

@ARCHITECTURE.md

---

## 项目

AI 驱动的中古风简历编辑器。Typst 渲染 + OpenRouter AI + 中国古风设计系统（宣纸、墨砚、印章、窗棂、祥云）。

---

## 主控协议

我（Claude）是管线的控制器，不是被动调度器。`docs/PIPELINE.md` 是我的操作仪表盘。

### 会话启动

每次新会话，我必须：
1. 读取 `docs/PIPELINE.md`（管线状态、阻塞项、计划任务）——显式 Read，不 @引用（文件频繁变动，@引用会加载过时快照）
2. 运行 `bash scripts/trace.sh`（溯源覆盖率报告）
3. 向用户报告当前状态和建议的下一步行动
4. 不做任何工作直到用户确认方向

### 管线运行

分发 Agent 任务时：
1. **准备输入** — 为 Agent 提取精确的输入上下文（不多不少）
2. **Agent 执行** — Agent 完成后产出必须包含溯源表
3. **阻塞门检查** — 主控（不是 Agent 自己）逐条校验溯源表
4. **通过** → 更新 PIPELINE.md，启动下游 Agent
5. **不通过** → 退回 Agent 补全，**不启动下游**

### 阻塞门

每个 Agent 的输出文档必须包含**溯源表**——映射每个输入条目到处理结果：

```markdown
## 溯源表

| 输入条目 | 处理 | 输出位置 | 备注 |
|---|---|---|---|
| R1.1 富文本编辑 | 已覆盖 | §3.2 | — |
| R1.2 撤销/重做 | 显式排除 | — | v1 不含，已上报 Q3 |
```

**主控校验步骤**：
1. 提取上游文档的全部条目 ID
2. 读取 Agent 输出的溯源表
3. 每个输入 ID 是否出现？「已覆盖」的位置是否真实存在？「显式排除」的理由是否合理？
4. **缺失 > 0 → FAIL**，退回补全。不存在"差不多就行"

**管线门禁**：

| 门 | 交接点 | 校验方式 |
|---|---|---|
| G1 | req-review → requirements.md | 主控读溯源表，校验 intent 覆盖 |
| G2 | tech-selection → tech-decisions.md | 主控读溯源表，校验技术需求覆盖 |
| G3 | design → design-spec.md | 主控读溯源表，校验用户可见需求覆盖 |
| G4 | plan → exec-plan | 主控读溯源表，校验需求 ID → 任务映射 |
| G5 | feature → code | **`bash scripts/trace.sh --strict`**（机械化：代码中 `@req` 标注 → grep 覆盖率） |

G1-G4 是主控审阅（中约束），G5 是脚本执行（硬约束）。

### 工作完成后

每次工作阶段结束，主控必须：
1. 更新 `docs/PIPELINE.md`（溯源矩阵、时间线、阻塞项、计划任务）
2. 执行提交协议（测试通过 → 征得人类同意 → commit）

---

## 管线阶段

```
阶段 0  意图         人类编写 intent.md
阶段 1  需求结构化    req-review agent → requirements.md        ─┐
阶段 2  技术选型      tech-selection agent → tech-decisions.md   ─┤ 每步之间有阻塞门
阶段 3  环境搭建      lint + CI + 结构测试                       ─┤
阶段 4a 设计规范      design agent 阶段A → design-spec.md       ─┤
阶段 4b 业务开发      plan → exec-plan → feature agent → code   ─┘
持续    垃圾收集      doc-gardening agent 扫描漂移
```

**当前状态见 `docs/PIPELINE.md`**

---

## 三层约束体系

| 层级 | 机制 | 执行方式 | 能被绕过吗 |
|---|---|---|---|
| **硬约束** | 自定义 lint 规则 + CI 流水线 + 结构测试 | 代码执行，构建失败即阻断 | 不能 |
| **中约束** | `.claude/rules/` | 自动注入 Agent 上下文 | 理论上可以 |
| **软约束** | `docs/` | Agent 需主动读取 | 不读就不知道 |

**原则：当中约束被反复违反时，将其升级为硬约束（lint 规则）。**

---

## 知识地图

```
docs/PIPELINE.md                      ← 主控操作仪表盘（管线状态/溯源/时间线/计划）
docs/product-specs/intent.md          ← 原始意图（只读）
docs/product-specs/requirements.md    ← 结构化需求
docs/design-docs/design-spec.md      ← 设计规范
docs/design-docs/tech-decisions.md   ← 技术选型决策
docs/design-docs/classical-tokens.md ← 设计令牌
ARCHITECTURE.md                       ← 域分层与依赖规则
docs/exec-plans/active/               ← 进行中的执行计划
docs/references/                      ← 外部 API 参考
```

---

## Agent 角色

| Agent | 触发场景 | 输入 | 输出位置 |
|---|---|---|---|
| **req-review** | 新功能意向、需求变更 | intent.md + 对话 | docs/product-specs/ |
| **tech-selection** | 引入新依赖、架构决策 | requirements.md + 候选方案 | docs/design-docs/tech-decisions.md |
| **design(A)** | 设计规范制定 | requirements.md + tech-decisions.md + 网络调研 | docs/design-docs/design-spec.md |
| **design(B)** | UI 组件实现 | design-spec.md (approved) | src/ui/, docs/design-docs/ |
| **feature** | 功能实现 | exec-plan + 架构文档 | src/ |
| **doc-gardening** | 定期运行（扫描漂移） | 全库 docs/ | 修复 PR |

Agent 定义见 `.claude/agents/`。

---

## 协议

完整定义见 `.claude/rules/protocols.md`。核心三条：

1. **交接** — Agent 输出带 `status` frontmatter + 溯源表。主控执行阻塞门后才传下游。
2. **上报** — 无法判断时写"待人类裁决"章节，必须给选项+阻塞关系。
3. **裁决回注** — 人类裁决必须写回文档。口头回答不算数。

---

## 人类触点

| 触点 | 做什么 | 何时 |
|---|---|---|
| 意图输入 | 编写 intent.md | 项目启动/需求变更 |
| 审批 | status: review → approved | Agent 产出后 |
| 裁决 | 回答开放问题，写回文档 | Agent 上报时 |
| 纠偏 | 行为偏差 → 编码为 rules/lint | 持续 |

---

## 反馈循环

### 硬循环（机械化，不依赖注意力）

| 循环 | 传感器 | 比较器 | 执行器 | 闭合 |
|---|---|---|---|---|
| **L1 代码质量** | `tsc` / `eslint` / `vitest` | 编译规则 / lint 规则 / 测试断言 | 开发者修复 | 构建通过 |
| **L2 溯源验证** | `scripts/trace.sh`（pre-commit hook 自动执行） | 每个需求 ID 在代码中有 `@req` 标注 | feature agent 补标注或补实现 | `trace.sh --strict` exit 0 |

> L2 同时解决了"谁监督主控"的问题——即使主控忘了跑 trace.sh，pre-commit hook 自动拦截。
> Hook 配置：`.githooks/pre-commit`，通过 `git config core.hooksPath .githooks` 激活。

### 门禁循环（主控执行，中约束）

| 循环 | 传感器 | 比较器 | 执行器 | 闭合 |
|---|---|---|---|---|
| **L3 阻塞门** | 主控读溯源表 | 每个输入条目有对应输出 | 退回 Agent 补全 | 门禁通过，启动下游 |
| **L4 裁决落地** | 主控检查：已裁决问题是否体现在代码中 | 裁决 → requirements → plan → code 链完整 | 补建缺失环节 | `trace.sh` 覆盖对应 ID |

### 演进循环（人类参与）

| 循环 | 传感器 | 比较器 | 执行器 | 闭合 |
|---|---|---|---|---|
| **L5 环境进化** | Agent 失败/卡住 | 应成功 | 诊断：缺上下文/约束/工具 → 补建 | Agent 重试成功 |
| **L6 约束升级** | 同类违规 ≥ 3 次 | 0 违规 | docs → rules → lint 逐级升级 | 违规消失 |
| **L7 产品走查** | req-review Phase B | 需求 vs 实现对齐 | 发现缺口 → 裁决 → 重入管线 | 走查无 S0 |

### 会话循环

| 循环 | 传感器 | 比较器 | 执行器 | 闭合 |
|---|---|---|---|---|
| **L8 跨会话连续性** | 新会话启动 | PIPELINE.md 状态 vs 当前文件状态 | 主控读 PIPELINE.md + trace.sh → 报告 | 用户确认方向 |

**核心原则**：Agent 失败不是"再试一次"，是"环境缺了什么"。
