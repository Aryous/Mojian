# 管线控制台

> 主控 Agent（Claude）的操作备注。每次新会话先跑 `bash .claude/scripts/harness-doctor.sh`，再按需 Read 此文件。
> 溯源覆盖率由 `.claude/scripts/trace.sh` 机械化生成（自推导 R + F），不在此手工维护。
> 此文件只记录脚本无法推导的信息：管线状态、裁决状态、计划任务与人工备注。
> 该文件不是实时真相源；实时就绪状态以 doctor / trace / 验证命令输出为准。
>
> 最后更新：2026-03-27

---

## 管线状态

| 阶段 | 状态 | 产出 | 阻塞门 | 日期 |
|---|---|---|---|---|
| 0 意图 | ✅ | intent.md (approved) | — | 03-26 |
| 1 需求 | ✅ | requirements.md (approved) | G1 ✅ | 03-27 |
| 2 技术选型 | ✅ | tech-decisions.md (approved) | G2 ✅ | 03-26 |
| 3 环境搭建 | ✅ | lint/build/test 就绪 | — | 03-26 |
| 4a 设计规范 | ✅ | design-spec.md (approved) | G3 ✅ | 03-26 |
| 4b 功能实现 | 🔄 | src/ | G5: trace.sh 自推导 | 03-27 |

**当前瓶颈**：以 `bash .claude/scripts/harness-doctor.sh` 输出为准。本文件不单独声明“是否可实现”。

---

## Harness v2 升级

**日期**：2026-03-27
**变更**：
- CLAUDE.md 重构为 Harness OS（框架与项目解耦）
- 新增 `.claude/project.md`（项目身份配置）
- trace.sh 升级为自推导（从 requirements.md 提取 R + S0/S1 F）
- ID 分类法正式化（R/F/Q/S）
- @req 标注从 Q 迁移到 F（Q13→F01, Q14→F04, Q15→F10, Q17→F12）
- 删除手动溯源清单
- 所有 agent 定义更新 R + F 标注约定

---

## 阻塞项

无。

---

## 时间线

| 日期 | 动作 | 执行者 | 产出 |
|---|---|---|---|
| 03-26 | 意图→需求→技术选型→设计→环境→功能实现 | 全链路 | v1 基础版本 |
| 03-27 | 多页预览 + 编辑器 UI 重设计 | superpowers | SVG 分页, 工具栏 |
| 03-27 | AI UX 诊断 → 产品走查 → AI 交互规范 | 主控+agents | 22 gaps, 4 S0 |
| 03-27 | Harness v2 升级 | 主控 | 框架解耦, trace.sh 自推导, ID 分类法 |

---

## 计划任务

### 紧急（S0 未实现）
- [ ] F05 撤销/重做

### 下一步（S1）
- [ ] F11 chips optionId 修复
- [ ] F13 quick actions targetSection 修复

### 技术债（S1-S2）
- [ ] F06 技能等级下拉
- [ ] F09 删除确认
- [ ] F19 API Key 安全
