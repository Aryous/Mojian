---
status: review
scope: trace
mode: one_shot
reason: [一句话说明为什么需要豁免]
approved_by:
approved_date:
expires: YYYY-MM-DD
covers: []
consumed_by_commit:
consumed_date:
last_used_commit:
last_used_date:
paths: [docs/exec-plans/completed/example.md]
---

# 豁免：[标题]

## 背景

[说明这次为什么会被历史债或系统缺口阻塞。]

## 允许跳过

- [允许跳过的门禁，例如 trace --strict]
- [本次允许继续推进的范围]

## 约束

- [本次变更不得扩大范围]
- [仍需保留原始失败报告]
- [其余 lint / typecheck / tests 必须通过]

## 退出条件

- [什么时候删除这份豁免]
- [对应历史债如何被补齐]
