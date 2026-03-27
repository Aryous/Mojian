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
| 1 需求 | ✅ | requirements.md (approved) | G1 ✅ | 03-27 |
| 2 技术选型 | ✅ | tech-decisions.md (approved) | G2 ✅ | 03-26 |
| 3 环境搭建 | ✅ | lint/build/test 就绪 | — | 03-26 |
| 4a 设计规范 | ✅ | design-spec.md (approved) | G3 ✅ | 03-26 |
| 4b 功能实现 | 🔄 | src/ | G5: `trace.sh` 13/13 (100%) | 03-27 |

**当前瓶颈**：无。requirements.md 已 approved，可推进实现。

---

## 阻塞项

| 阻塞 | 等待 | 影响 |
|---|---|---|
| ai-interaction-spec 需更新 | 基于 Q15(聊天式)/Q17(自动路由) 裁决 | AI 交互重设计 |

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
- [x] 裁决 Q13-Q17（2026-03-27 已完成）
- [x] 为现有代码补 @req 标注（trace.sh 13/13 100%）
- [ ] 更新 ai-interaction-spec.md（基于 Q15 聊天式 + Q17 自动路由）

### 下一步（按优先级）
- [ ] AI 聊天式交互（Q15）— 对话历史管理 + 多轮上下文
- [ ] AI 从零生成模式（Q13）— 冷启动 system prompt + UI 入口
- [ ] AI 自动路由（Q17）— 轻量 AI 调用选择 prompt
- [ ] Markdown 支持（Q14）— textarea markdown + Typst 解析
- [ ] F05 撤销/重做（S0）
- [ ] F11 chips optionId 修复（S1 bug）
- [ ] F13 quick actions targetSection 修复（S1 bug）

### 技术债
- [ ] F06 技能等级下拉
- [ ] F09 删除确认
- [ ] F19 API Key 安全
