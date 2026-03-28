# 编辑器配色与结构重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将编辑器主界面从暖黄/暖棕配色升级为中性灰白/真墨色，工具栏去装饰加朱砂线，左侧面板从卡片容器改为账簿式墨线分隔。

**Architecture:** 三层令牌体系（L1 基础色 → L2 语义色 → L3 组件色）确保改动从根部级联。组件 CSS 只引用令牌，不使用裸色值（见 `.claude/rules/ui/design-tokens.md`）。Token 层改动自动级联至全站——编辑器面板背景、预览区背景、文字色等均通过语义令牌自动更新，无需逐个修改组件。

**Tech Stack:** CSS Custom Properties, CSS Modules, React (TSX), Vitest

**Spec:** `docs/superpowers/specs/2026-03-27-editor-color-redesign.md`

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/ui/tokens/index.css` | Modify | L1 基础色 + L2 语义色 + ink-surface + shadow 更新 |
| `src/ui/pages/EditorPage/TopToolbar.module.css` | Modify | 工具栏去装饰 + 朱砂底线 + 品牌文字全透明度 |
| `src/ui/pages/EditorPage/EditorPage.module.css` | Modify | L3 编辑器令牌 + 卡片→账簿样式 |
| `src/ui/pages/EditorPage/EditorPage.tsx` | Modify | 添加 sectionContent 包裹层（内容对齐） |
| `src/ui/pages/EditorPage/SectionEditor.module.css` | Modify | listItem 卡片→细线分隔 |
| `src/ui/pages/EditorPage/ResumePreview.module.css` | Modify | svgPreview 背景色令牌化 |

---

### Task 1: Design Tokens — L1 Base Color Migration

**Files:**
- Modify: `src/ui/tokens/index.css:5-17` (L1 section)

- [ ] **Step 1: Update five L1 base colors**

Replace the five colors defined in the spec. Also adjust `--color-paper-warm` proportionally (it sits between base and aged; if both neighbors change, warm must follow).

In `src/ui/tokens/index.css`, replace lines 7-13:

```css
  /* ===== L1 基础色（中国传统色） ===== */
  --color-ink-deep: #1A1A1A;       /* 玄色 — 中性深灰 */
  --color-ink-medium: #363636;     /* 黧色 — 工具栏深灰 */
  --color-ink-light: #6B5B3E;      /* 淡墨 */
  --color-ink-faint: #9B8E7E;      /* 极淡墨 — 干笔淡扫 */
  --color-paper-base: #F7F5F0;     /* 缣色 — 微暖白宣纸 */
  --color-paper-warm: #F2EEE8;     /* 牙色 — 宣纸暖调 */
  --color-paper-aged: #ebe8e1;     /* 枯色 — 暖灰白 */
```

The 5 spec-mandated changes:
- `--color-ink-deep`: `#1C1208` → `#1A1A1A` (去棕调)
- `--color-ink-medium`: `#3B2E1A` → `#363636` (去暖棕)
- `--color-paper-base`: `#F5EDD6` → `#F7F5F0` (去黄)
- `--color-paper-warm`: `#F0E6CE` → `#F2EEE8` (比例调整)
- `--color-paper-aged`: `#D4C4A0` → `#ebe8e1` (预览区)

- [ ] **Step 2: Add divider colors and border semantic tokens**

After line 17 (`--color-glaze`), add two new L1 colors:

```css
  --color-divider-wash: #C8C0B4;   /* 渐隐墨线 — section 间分隔 */
  --color-divider-subtle: #E0DCD4; /* 细线 — 条目间分隔 */
```

In the L2 border section (after line 41 `--sem-border-strong`), add:

```css
  --sem-border-subtle: var(--color-divider-subtle);
  --sem-border-divider: var(--color-divider-wash);
```

- [ ] **Step 3: Add resume paper semantic token**

In the L2 background section (after line 24 `--sem-bg-ink`), add:

```css
  --sem-bg-paper: #FFFFFF;          /* 简历纸面 — 纯白 */
```

- [ ] **Step 4: Update ink-surface rgba values**

The ink-surface tokens hardcode old paper-base RGB `(245, 237, 214)`. Update to new paper-base `(247, 245, 240)`:

Replace all ink-surface token values in lines 103-117:

```css
  /* ===== L3 墨砚面（ink-surface）— 深色背景上的浅色元素 ===== */
  /* 用于 AI 面板、深色抽屉等 ink-deep/ink-medium 背景上的 UI 元素 */
  /* 基于 paper-base 在深色上的不同透明度层级 */
  --ink-surface-text-body: rgba(247, 245, 240, 0.7);       /* 正文/主要可读文字 */
  --ink-surface-text-secondary: rgba(247, 245, 240, 0.55); /* 描述/次要文字 */
  --ink-surface-text-label: rgba(247, 245, 240, 0.5);      /* 标签/分类文字 */
  --ink-surface-text-muted: rgba(247, 245, 240, 0.4);      /* 极淡提示/空态 */
  --ink-surface-text-hint: rgba(247, 245, 240, 0.6);       /* 引导说明文字 */
  --ink-surface-text-placeholder: rgba(247, 245, 240, 0.35);/* 输入占位符 */
  --ink-surface-border: rgba(247, 245, 240, 0.15);         /* 卡片/区块边框 */
  --ink-surface-border-subtle: rgba(247, 245, 240, 0.1);   /* 分隔线/状态容器边框 */
  --ink-surface-border-input: rgba(247, 245, 240, 0.2);    /* 输入框边框 */
  --ink-surface-border-diff: rgba(247, 245, 240, 0.12);    /* 对比区块边框 */
  --ink-surface-bg-card: rgba(247, 245, 240, 0.06);        /* 卡片/容器背景 */
  --ink-surface-bg-faint: rgba(247, 245, 240, 0.04);       /* 最淡卡片背景 */
  --ink-surface-bg-input: rgba(247, 245, 240, 0.08);       /* 输入框背景 */
  --ink-surface-accent-bg: rgba(27, 73, 101, 0.2);         /* AI 靛青操作高亮背景 */
  --ink-surface-error-bg: rgba(194, 59, 34, 0.15);         /* 错误提示背景 */
```

- [ ] **Step 5: Update shadow rgba values**

Shadow colors use old ink-deep RGB `(28, 18, 8)`. Update to new `(26, 26, 26)`:

```css
  /* ===== 阴影 ===== */
  --shadow-subtle: 0 1px 2px rgba(26, 26, 26, 0.06);
  --shadow-medium: 0 2px 8px rgba(26, 26, 26, 0.10);
  --shadow-strong: 0 4px 16px rgba(26, 26, 26, 0.14);
```

- [ ] **Step 6: Run verification**

Run: `npx tsc -b --noEmit && npx vitest run`

Expected: All pass. Token changes are CSS-only, no TS impact.

- [ ] **Step 7: Commit**

```bash
git add src/ui/tokens/index.css
git commit -m "style(tokens): migrate base colors to neutral palette

- L1: ink-deep/medium → neutral gray, paper-base/warm/aged → cool white
- L1: add divider-wash + divider-subtle for ledger section dividers
- L2: add sem-border-subtle, sem-border-divider, sem-bg-paper
- Update ink-surface + shadow rgba to match new base colors"
```

---

### Task 2: TopToolbar — Remove Decorations, Add Vermillion Line

**Files:**
- Modify: `src/ui/pages/EditorPage/TopToolbar.module.css:1-59,234-239`

- [ ] **Step 1: Delete ::before ink drift animation**

Remove the entire `.root::before` block (lines 16-32) and the `@keyframes ink-drift` block (lines 34-37).

- [ ] **Step 2: Delete ::after ink stroke bottom line**

Remove the entire `.root::after` block (lines 39-59).

- [ ] **Step 3: Add vermillion bottom line and clean up .root**

Update `.root` to add the vermillion line and remove `overflow: hidden` (only needed for containing ::before):

```css
.root {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: var(--editor-toolbar-height);
  padding: 0 var(--space-4);
  background-color: var(--color-ink-medium);
  border-bottom: 1px solid var(--sem-action-primary);
  position: relative;
  z-index: 100;
}
```

Changes from current: removed `overflow: hidden`, added `border-bottom: 1px solid var(--sem-action-primary)`.

- [ ] **Step 4: Update brand text to full opacity**

Change `.brand` color from `var(--ink-surface-text-body)` (0.7 opacity) to `var(--sem-text-inverse)` (1.0 opacity):

```css
.brand {
  font-family: var(--font-family-display);
  font-size: var(--font-body);
  font-weight: var(--weight-bold);
  color: var(--sem-text-inverse);
  flex-shrink: 0;
  letter-spacing: 0.1em;
}
```

- [ ] **Step 5: Delete reduced-motion rule for ::before**

Remove the `@media (prefers-reduced-motion: reduce)` block at the end (lines 234-239), since `.root::before` no longer exists.

- [ ] **Step 6: Run verification**

Run: `npx tsc -b --noEmit && npx vitest run`

Expected: All pass. Start dev server (`npm run dev`), visually confirm:
- Toolbar is `#363636` neutral gray
- Bottom edge has 1px vermillion (`#C23B22`) line
- No floating ink blob or repeating ink-stroke pattern
- "墨简" brand text is fully opaque white

- [ ] **Step 7: Commit**

```bash
git add src/ui/pages/EditorPage/TopToolbar.module.css
git commit -m "style(toolbar): simplify to vermillion bottom line

- Delete ::before ink-drift animation (invisible on dark bg)
- Delete ::after ink-stroke bottom pattern (invisible on dark bg)
- Add 1px vermillion (--sem-action-primary) bottom border
- Brand text opacity 0.7 → 1.0 via --sem-text-inverse
- Remove overflow:hidden (no longer needed)"
```

---

### Task 3: EditorPage — Card Container to Ledger Style

**Files:**
- Modify: `src/ui/pages/EditorPage/EditorPage.module.css:1-14,62-82,120-131`
- Modify: `src/ui/pages/EditorPage/EditorPage.tsx:40-82`

- [ ] **Step 1: Replace L3 editor card tokens with ledger tokens**

In `EditorPage.module.css`, replace the L3 token block (lines 6-14 inside `.root`):

```css
.root {
  --editor-toolbar-height: 48px;
  --editor-divider-ink: var(--sem-border-divider);
  --editor-divider-subtle: var(--sem-border-subtle);
  --editor-section-accent: 3px;
  --editor-section-indent: 10px;
  --editor-ai-btn-border: rgba(27, 73, 101, 0.25);
  --editor-ai-btn-bg: rgba(27, 73, 101, 0.03);
  --editor-ai-btn-hover-bg: rgba(27, 73, 101, 0.1);
  --editor-ai-btn-hover-border: rgba(27, 73, 101, 0.4);
  --editor-scrollbar-thumb: rgba(107, 91, 62, 0.2);
  --editor-scrollbar-thumb-hover: rgba(107, 91, 62, 0.4);

  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--sem-bg-primary);
}
```

Changes: removed `--editor-card-bg` and `--editor-card-border`, added `--editor-divider-ink`, `--editor-divider-subtle`, `--editor-section-accent`, `--editor-section-indent`.

- [ ] **Step 2: Add ink-wash divider between sections**

Replace the `.sectionList` block:

```css
.sectionList {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 渐隐墨线 — section 间分隔（账簿式） */
.sectionList > :not(:first-child)::before {
  content: '';
  display: block;
  height: 1px;
  margin: var(--space-6) 0;
  background: linear-gradient(90deg,
    transparent,
    var(--editor-divider-ink) 15%,
    var(--editor-divider-ink) 85%,
    transparent);
}
```

- [ ] **Step 3: Remove card container styling from .sectionCard**

Replace the `.sectionCard` and `.sectionCard:hover` blocks:

```css
.sectionCard {
  position: relative;
  padding: 0;
}
```

Removes: `background`, `border-radius`, `border`, `box-shadow`, `transition`, hover shadow. Adds `position: relative` (needed for `dragHandle` absolute positioning).

- [ ] **Step 4: Update .sectionTitle for ledger style**

Replace the `.sectionTitle` block:

```css
.sectionTitle {
  flex: 1;
  font-family: var(--font-family-display);
  font-size: var(--font-body);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  color: var(--sem-text-primary);
  margin: 0;
  padding-left: var(--editor-section-indent);
  border-left: var(--editor-section-accent) solid var(--sem-action-primary);
  letter-spacing: 0.03em;
}
```

Changes: `border-left` width `2px` → `var(--editor-section-accent)` (3px), `padding-left` `var(--space-2)` → `var(--editor-section-indent)` (10px), added `letter-spacing: 0.03em`.

- [ ] **Step 5: Add .sectionContent class for content alignment**

Add after the `.sectionAiBtn:hover` block:

```css
/* 内容区域与标题朱砂竖线对齐 */
.sectionContent {
  padding-left: calc(var(--editor-section-accent) + var(--editor-section-indent));
}
```

This produces 13px left indent (3px + 10px), aligning content with the section title text.

- [ ] **Step 6: Update EditorPage.tsx to wrap SectionEditor**

In `src/ui/pages/EditorPage/EditorPage.tsx`, update the `DraggableSectionCard` component. Replace lines 41-79:

```tsx
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          {section.type !== 'personal' && (
            <div
              className={styles.dragHandle}
              onPointerDown={(e) => controls.start(e)}
            >
              <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden="true">
                <circle cx="3" cy="2" r="1.2" fill="currentColor" />
                <circle cx="7" cy="2" r="1.2" fill="currentColor" />
                <circle cx="3" cy="7" r="1.2" fill="currentColor" />
                <circle cx="7" cy="7" r="1.2" fill="currentColor" />
                <circle cx="3" cy="12" r="1.2" fill="currentColor" />
                <circle cx="7" cy="12" r="1.2" fill="currentColor" />
              </svg>
            </div>
          )}
          <h2 className={styles.sectionTitle}>{section.title}</h2>
          {section.type !== 'skills' && (
            <button
              type="button"
              className={styles.sectionAiBtn}
              onClick={() => onAi(section.title)}
              aria-label={`墨灵润色${section.title}`}
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
              墨灵
            </button>
          )}
        </div>
        <div className={styles.sectionContent}>
          <SectionEditor
            type={section.type}
            resume={resume}
            onUpdate={onUpdate}
          />
        </div>
      </div>
```

Changes from current:
1. Added `<div className={styles.sectionContent}>` wrapper around `<SectionEditor>`
2. AI button label `AI 润色` → `墨灵`, aria-label `AI 润色` → `墨灵润色`

- [ ] **Step 7: Run verification**

Run: `npx tsc -b --noEmit && npx vitest run`

Expected: All pass. Visually confirm:
- No card borders/shadows/rounded corners on sections
- Ink-wash gradient dividers appear between sections (not above the first)
- Section titles have 3px vermillion left border
- Content area aligns with title text

- [ ] **Step 8: Commit**

```bash
git add src/ui/pages/EditorPage/EditorPage.module.css src/ui/pages/EditorPage/EditorPage.tsx
git commit -m "style(editor): card containers → ledger-style ink dividers

- Remove sectionCard bg/border/radius/shadow
- Add ink-wash gradient dividers between sections
- Section title: 3px vermillion border + letter-spacing
- Content area aligned with title via sectionContent wrapper
- AI button label: AI 润色 → 墨灵"
```

---

### Task 4: SectionEditor + ResumePreview Adaptation

**Files:**
- Modify: `src/ui/pages/EditorPage/SectionEditor.module.css:49-55`
- Modify: `src/ui/pages/EditorPage/ResumePreview.module.css:28-32`

- [ ] **Step 1: Update .listItem from card to line-separated style**

In `SectionEditor.module.css`, replace the `.listItem` block:

```css
.listItem {
  position: relative;
  padding: var(--space-4);
  padding-right: var(--space-8);
  padding-bottom: var(--space-4);
  background: transparent;
  border-bottom: 1px solid var(--sem-border-subtle);
}
```

Changes: `background` from `var(--sem-bg-secondary)` → `transparent`, `border-radius` removed, added `border-bottom: 1px solid var(--sem-border-subtle)`.

- [ ] **Step 2: Tokenize svgPreview background**

In `ResumePreview.module.css`, replace the `.svgPreview` block:

```css
.svgPreview {
  max-width: 100%;
  background-color: var(--sem-bg-paper);
  box-shadow: var(--shadow-medium);
}
```

Changes: `background-color` from raw `#ffffff` → `var(--sem-bg-paper)` token.

- [ ] **Step 3: Run verification**

Run: `npx tsc -b --noEmit && npx vitest run`

Expected: All pass. Visually confirm:
- List items (education, work entries) have subtle bottom borders, no card backgrounds
- Resume preview paper is white with medium shadow
- Preview area background is warm gray-white (`#ebe8e1`)

- [ ] **Step 4: Commit**

```bash
git add src/ui/pages/EditorPage/SectionEditor.module.css src/ui/pages/EditorPage/ResumePreview.module.css
git commit -m "style(editor): listItem card→line separator + tokenize paper bg

- SectionEditor .listItem: remove bg/radius, add subtle bottom border
- ResumePreview .svgPreview: raw #ffffff → var(--sem-bg-paper) token"
```

---

### Task 5: Full Regression Verification

- [ ] **Step 1: Run all checks**

```bash
npx tsc -b --noEmit && npx vitest run
```

Expected: All pass.

- [ ] **Step 2: Visual regression checklist**

Start dev server (`npm run dev`) and verify:

1. **工具栏**: `#363636` 深灰背景 + 底部 1px 朱砂线 + "墨简"全透明度白字
2. **编辑面板**: `#F7F5F0` 微暖白背景，section 间渐隐墨线分隔
3. **Section 标题**: 3px 朱砂竖线 + display 字体 + 微扩字间距
4. **条目**: 无卡片背景，细线底部分隔
5. **预览区**: `#ebe8e1` 暖灰白背景
6. **简历纸**: 纯白 + 中等阴影
7. **墨灵 FAB**: 毛笔图标可见（obi 配色不变）
8. **AI 按钮**: 标签显示"墨灵"
9. **模板抽屉**: 打开/关闭正常
10. **分页导航**: 多页简历翻页正常

- [ ] **Step 3: Final commit (if any fixups needed)**

If any visual issues found, fix and commit with descriptive message.
