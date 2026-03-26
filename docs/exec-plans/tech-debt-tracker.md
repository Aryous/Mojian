# 技术债追踪

> doc-gardening agent 维护。每次发现新债务立即记录，还清后标注日期。

## 格式

```
- [ ] [P0/P1/P2] 描述 — 发现于 YYYY-MM-DD
- [x] [P1] 描述 — 发现于 YYYY-MM-DD，还清于 YYYY-MM-DD
```

## 当前债务

- [ ] [P1] Feature 切片 3-5 缺少测试 — 发现于 2026-03-26。feature agent 未遵守"新增代码有测试"规则，已补强 agent 定义。
- [x] [P0] React hooks 顺序违规导致白屏 — 发现于 2026-03-26，修复于 2026-03-26。feature agent 将 useMemo/useCallback 放在 early return 之后，已新增 `.claude/rules/ui/react.md` 防止复发。
- [ ] [P2] Feature 切片 3/4 无执行计划记录 — 发现于 2026-03-26。模板系统和 PDF 导出未走执行计划流程直接实现，需补写到 completed/。
