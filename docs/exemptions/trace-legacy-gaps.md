---
status: approved
scope: trace
mode: until_resolved
reason: 4 个既有 S1 走查缺口（F06/F07/F08/F13）阻塞所有新变更的 closeout，非本次引入
approved_by: Lucas
approved_date: 2026-03-28
expires: 2026-04-30
covers: [F06, F07, F08, F13]
consumed_by_commit:
consumed_date:
last_used_commit:
last_used_date:
paths: []
---

# 豁免：既有 trace 缺口

## 背景

trace.sh 自推导追踪 requirements.md 中所有 S0/S1 条目。当前 4 个 S1 条目尚未实现，导致 trace --strict 始终失败（85% 覆盖率）。这些缺口在本轮 F05/F14/F19/F23 修复之前就已存在，不是任何一次变更引入的。

未覆盖项：
- F06 — 技能等级控件（实现缺陷）
- F07 — 自定义模块（未实现）
- F08 — Section 可见性控制（未实现）
- F13 — quick actions 忽略 targetSection（实现缺陷）

## 允许跳过

- `trace --strict` 的 100% 覆盖率要求
- closeout.sh 的 traceability blocker

## 约束

- 本豁免不覆盖新引入的 trace 缺口——新增的 F/R 条目必须有对应 @req
- lint / typecheck / tests 必须全部通过
- closeout.sh 仍输出原始失败信息，仅降级为受控例外

## 退出条件

- F06/F07/F08/F13 四项全部实现并标注 @req 后删除本豁免
- 或四项被裁决为不再进入 trace 范围后删除本豁免
- 过期日期：2026-04-30
