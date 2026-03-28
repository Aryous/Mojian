# 技术债追踪

> 由主控维护。doctor / doc-lint / closeout 暴露出重复性问题时立即记录，还清后标注日期。

## 格式

```
- [ ] [P0/P1/P2] 描述 — 发现于 YYYY-MM-DD
- [x] [P1] 描述 — 发现于 YYYY-MM-DD，还清于 YYYY-MM-DD
```

## 当前债务

- [x] [P1] Feature 切片 3-5 缺少测试 — 发现于 2026-03-26，还清于 2026-03-26。38 个单元测试覆盖四层。
- [x] [P0] React hooks 顺序违规导致白屏 — 发现于 2026-03-26，修复于 2026-03-26。feature agent 将 useMemo/useCallback 放在 early return 之后，已新增 `.claude/rules/ui/react.md` 防止复发。
- [x] [P2] Feature 切片 3/4 无执行计划记录 — 发现于 2026-03-26，还清于 2026-03-26。已补写 template-system.md 和 pdf-export.md 到 completed/。
