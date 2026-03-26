---
paths:
  - "src/ui/**/*.ts"
  - "src/ui/**/*.tsx"
  - "src/ui/**/*.css"
---

# UI 层设计令牌约束

## 规则

所有视觉属性必须通过 `src/ui/tokens/` 中的设计令牌引用。

## 禁止

- 裸色值：`color: #2C1810` `bg-[#F5EDD6]`
- 裸字号：`font-size: 14px` `text-[14px]`
- 裸间距魔法数字：`padding: 12px` `p-[12px]`

## 正确

- 使用令牌变量：`color: var(--color-ink-deep)` `bg-paper-base`
- 使用令牌 class：`text-heading-md` `p-spacing-md`

## 为什么

- 古风设计系统的一致性依赖令牌约束
- 未来主题切换（如暗色墨纸模式）只需改令牌层
- Agent 能通过令牌名理解语义（`ink-deep` 比 `#2C1810` 可读）
