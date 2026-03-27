# 管线控制台

> 主控 Agent（Claude）的操作文档。每次新会话显式 Read 此文件。
> 溯源覆盖率由 `scripts/trace.sh` 机械化生成，不在此手工维护。
> 此文件只记录脚本无法推导的信息：管线状态、阻塞项、裁决状态、计划任务。
>
> 最后更新：2026-03-27

---

## 管线状态

| 阶段 | 状态 | 产出 | 阻塞门 | 日期 |
|---|---|---|---|---|
| 0 意图 | ✅ | intent.md (approved) | — | 03-26 |
| 1 需求 | ⚠️ 重审中 | requirements.md (review) | G1 ✅ → 走查后需重审批 | 03-27 |
| 2 技术选型 | ✅ | tech-decisions.md (approved) | G2 ✅ | 03-26 |
| 3 环境搭建 | ✅ | lint/build/test 就绪 | — | 03-26 |
| 4a 设计规范 | ✅ | design-spec.md (approved) | G3 ✅ | 03-26 |
| 4b 功能实现 | 🔄 | src/ | G5: `trace.sh` 报告 0/13 | 03-27 |

**当前瓶颈**：requirements.md 处于 review（Q13-Q17 待裁决），下游工作受限。

---

## 阻塞项

| 阻塞 | 等待 | 影响 |
|---|---|---|
| Q13-Q17 待裁决 | 人类裁决 | requirements.md 无法重审批 |
| ai-interaction-spec 需更新 | 基于 Q15/Q17 裁决 | AI 交互重设计 |
| 现有代码无 @req 标注 | feature agent 补标 | trace.sh 覆盖率 0% |

---

## 时间线

| 日期 | 动作 | 执行者 | 产出 |
|---|---|---|---|
| 03-26 | 意图→需求→技术选型→设计→环境→功能实现 | 全链路 | v1 基础版本 |
| 03-27 | 多页预览 + 编辑器 UI 重设计 | superpowers | SVG 分页, 工具栏 |
| 03-27 | AI UX 诊断 → 产品走查 → AI 交互规范 | 主控+agents | 22 gaps, 4 S0 |
| 03-27 | 管线诊断 + 阻塞门机制 + trace.sh | 主控 | 管线重设计 |

---

## 计划任务

### 紧急（阻塞后续）
- [ ] 裁决 Q13-Q17
- [ ] 更新 ai-interaction-spec.md
- [ ] 为现有代码补 @req 标注（使 trace.sh 反映真实覆盖率）

### 下一步
- [ ] AI 交互重实现
- [ ] 冷启动机制（Q13）
- [ ] 富文本/markdown（Q14）

### 技术债
- [ ] F06 技能等级下拉
- [ ] F09 删除确认
- [ ] F19 API Key 安全
- [ ] tests/unit/optimize.test.ts 引用旧函数名
