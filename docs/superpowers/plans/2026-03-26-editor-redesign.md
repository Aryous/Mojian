# EditorPage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the EditorPage with a 42/58 split, streamlined toolbar with editable title and template card popover, per-section AI buttons, a FAB, and a full AI chat drawer with indigo/obi color scheme.

**Architecture:** Replace the current 55/45 editor with a new layout: slim toolbar (back + brand + editable title | template popover trigger + export) -> workspace (42% editor with hover AI buttons per section + 58% preview with margin-shift on AI drawer open). The old AiPanel (options-only) is replaced by AiDrawer (quick actions + chat + input). The old 5-button template bar is replaced by a popover with thumbnail cards.

**Tech Stack:** React 18, CSS Modules, Zustand, motion/react (AnimatePresence), existing design tokens from `src/ui/tokens/index.css`

**Design Spec:** `docs/superpowers/specs/2026-03-26-editor-redesign-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Rewrite | `src/ui/pages/EditorPage/TopToolbar.tsx` | Slim toolbar: back + brand + editable title / template trigger + export PDF |
| Rewrite | `src/ui/pages/EditorPage/TopToolbar.module.css` | Toolbar styles |
| Create | `src/ui/pages/EditorPage/TemplatePopover.tsx` | Template card popover with 5 thumbnail cards |
| Create | `src/ui/pages/EditorPage/TemplatePopover.module.css` | Popover styles |
| Create | `src/ui/pages/EditorPage/AiDrawer.tsx` | AI drawer: header + quick actions + chat + chips + input |
| Create | `src/ui/pages/EditorPage/AiDrawer.module.css` | Drawer styles (obi color scheme) |
| Create | `src/ui/pages/EditorPage/AiFab.tsx` | Floating action button for AI |
| Create | `src/ui/pages/EditorPage/AiFab.module.css` | FAB styles |
| Rewrite | `src/ui/pages/EditorPage/EditorPage.tsx` | New layout: 42/58 split, section cards with AI buttons, preview shift |
| Rewrite | `src/ui/pages/EditorPage/EditorPage.module.css` | New layout styles |
| Modify | `src/ui/pages/EditorPage/ResumePreview.tsx` | Remove export button, accept `shifted` prop |
| Modify | `src/ui/pages/EditorPage/ResumePreview.module.css` | Add shifted canvas style, remove export button styles |
| Delete | `src/ui/pages/EditorPage/AiPanel.tsx` | Replaced by AiDrawer |
| Delete | `src/ui/pages/EditorPage/AiPanel.module.css` | Replaced by AiDrawer.module.css |

---

### Task 1: Rewrite TopToolbar (slim toolbar with editable title)

**Files:**
- Rewrite: `src/ui/pages/EditorPage/TopToolbar.tsx`
- Rewrite: `src/ui/pages/EditorPage/TopToolbar.module.css`

**Context:** The current TopToolbar has 5 template text buttons + an AI button in the center. The redesign replaces all of that with: left (back + brand + editable title input), right (template popover trigger + export PDF button). The toolbar height drops from 56px to 48px. The `LatticePattern` bottom decoration is removed.

**Dependencies:** The `TemplatePopover` component does not exist yet. In this task, the template trigger button is wired to call a callback `onOpenTemplatePopover` — the actual popover is built in Task 2.

- [ ] **Step 1: Rewrite TopToolbar.tsx**

```tsx
// src/ui/pages/EditorPage/TopToolbar.tsx
// Slim toolbar: back + brand + editable title | template trigger + export PDF
import { useCallback, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { usePreviewStore } from '@/runtime/store'
import type { Resume } from '@/types'
import styles from './TopToolbar.module.css'

interface TopToolbarProps {
  title: string
  templateId: string
  templateName: string
  resume: Resume
  onTitleChange: (title: string) => void
  onOpenTemplatePopover: () => void
}

export function TopToolbar({
  title,
  templateName,
  resume,
  onTitleChange,
  onOpenTemplatePopover,
}: TopToolbarProps) {
  const navigate = useNavigate()
  const { exporting, compiling, exportPdf } = usePreviewStore()
  const [localTitle, setLocalTitle] = useState(title)

  const handleBack = useCallback(() => {
    navigate('/dashboard')
  }, [navigate])

  const handleTitleBlur = useCallback(() => {
    const trimmed = localTitle.trim()
    if (trimmed && trimmed !== title) {
      onTitleChange(trimmed)
    } else {
      setLocalTitle(title)
    }
  }, [localTitle, title, onTitleChange])

  const handleTitleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }, [])

  const handleExport = useCallback(() => {
    exportPdf(resume)
  }, [exportPdf, resume])

  return (
    <header className={styles.root}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={handleBack}
          aria-label="返回工作台"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className={styles.brand}>墨简</span>
        <span className={styles.separator}>|</span>
        <input
          className={styles.titleInput}
          value={localTitle}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setLocalTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          onFocus={(e) => e.target.select()}
          aria-label="简历标题"
        />
      </div>
      <div className={styles.right}>
        <button
          type="button"
          className={styles.templateTrigger}
          onClick={onOpenTemplatePopover}
        >
          <span className={styles.templateThumb} />
          <span>{templateName}</span>
          <span className={styles.templateArrow}>&#9662;</span>
        </button>
        <button
          type="button"
          className={styles.exportBtn}
          onClick={handleExport}
          disabled={exporting || compiling}
        >
          {exporting ? '导出中...' : '导出 PDF'}
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Rewrite TopToolbar.module.css**

```css
/* src/ui/pages/EditorPage/TopToolbar.module.css */
/* Slim toolbar — 48px height */

.root {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 var(--space-4);
  background-color: var(--sem-bg-primary);
  border-bottom: 1px solid var(--color-paper-aged);
  position: relative;
  z-index: 100;
}

/* ===== Left: back + brand + title ===== */

.left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.backBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--sem-text-secondary);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-brush-touch);
}

.backBtn:hover {
  background-color: var(--sem-bg-secondary);
}

.brand {
  font-family: var(--font-family-display);
  font-size: 15px;
  font-weight: var(--weight-bold);
  color: var(--sem-text-primary);
  flex-shrink: 0;
}

.separator {
  color: var(--sem-text-disabled);
  font-size: var(--font-small);
  flex-shrink: 0;
  user-select: none;
  margin: 0 var(--space-1);
}

.titleInput {
  font-family: var(--font-family-body);
  font-size: var(--font-small);
  color: var(--sem-text-secondary);
  background: transparent;
  border: none;
  border-bottom: 1px dashed transparent;
  padding: 3px var(--space-2);
  outline: none;
  width: 140px;
}

.titleInput:hover {
  border-bottom-color: var(--sem-text-disabled);
}

.titleInput:focus {
  color: var(--sem-text-primary);
  border-bottom-color: var(--sem-action-ai);
  border-bottom-style: solid;
}

/* ===== Right: template trigger + export ===== */

.right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.templateTrigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 30px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--sem-text-disabled);
  background: transparent;
  color: var(--sem-text-secondary);
  font-family: var(--font-family-body);
  font-size: var(--font-caption);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-brush-touch);
}

.templateTrigger:hover {
  background-color: var(--sem-bg-secondary);
}

.templateThumb {
  display: block;
  width: 16px;
  height: 22px;
  border: 1px solid var(--sem-text-disabled);
  border-radius: 1px;
  background: #fff;
  position: relative;
  overflow: hidden;
}

.templateThumb::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 2px;
  right: 2px;
  height: 2px;
  background: var(--sem-text-primary);
  border-radius: 1px;
  box-shadow:
    0 4px 0 var(--color-paper-aged),
    0 7px 0 var(--color-paper-aged);
}

.templateArrow {
  font-size: 8px;
  opacity: 0.5;
}

.exportBtn {
  height: 30px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  background: var(--sem-action-primary);
  color: var(--sem-text-inverse);
  border: none;
  font-family: var(--font-family-body);
  font-size: var(--font-caption);
  font-weight: var(--weight-bold);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-brush-touch);
}

.exportBtn:hover {
  background: var(--sem-action-primary-hover);
}

.exportBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit 2>&1 | head -20`
Expected: Errors about `TopToolbar` props mismatch in `EditorPage.tsx` — this is expected and will be fixed when `EditorPage.tsx` is rewritten in Task 6.

- [ ] **Step 4: Commit**

```bash
git add src/ui/pages/EditorPage/TopToolbar.tsx src/ui/pages/EditorPage/TopToolbar.module.css
git commit -m "refactor(editor): rewrite TopToolbar — slim 48px, editable title, template trigger

- Remove 5 template text buttons and AI toggle button
- Add editable title input with blur-to-save
- Add template popover trigger (popover built separately)
- Move export PDF to toolbar (will remove from preview)
- Remove LatticePattern decoration"
```

---

### Task 2: Create TemplatePopover

**Files:**
- Create: `src/ui/pages/EditorPage/TemplatePopover.tsx`
- Create: `src/ui/pages/EditorPage/TemplatePopover.module.css`

**Context:** A floating popover triggered from the toolbar template button. Shows a 5-column grid of template cards, each with a CSS-wireframe thumbnail. Clicking a card selects that template and closes the popover. Clicking the backdrop closes it. The popover animates in with translateY(-8px)->0 + opacity.

- [ ] **Step 1: Create TemplatePopover.tsx**

```tsx
// src/ui/pages/EditorPage/TemplatePopover.tsx
// Template selection popover with thumbnail cards
import { useCallback } from 'react'
import { TEMPLATES, type TemplateMeta } from '@/config'
import styles from './TemplatePopover.module.css'

interface TemplatePopoverProps {
  open: boolean
  currentTemplateId: string
  onSelect: (templateId: string) => void
  onClose: () => void
}

export function TemplatePopover({ open, currentTemplateId, onSelect, onClose }: TemplatePopoverProps) {
  const handleSelect = useCallback((t: TemplateMeta) => {
    onSelect(t.id)
    onClose()
  }, [onSelect, onClose])

  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`${styles.popover} ${open ? styles.popoverOpen : ''}`}
        role="dialog"
        aria-label="选择模板"
      >
        <div className={styles.title}>选择模板</div>
        <div className={styles.grid}>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.card} ${currentTemplateId === t.id ? styles.cardActive : ''}`}
              onClick={() => handleSelect(t)}
              title={t.description}
            >
              <div className={`${styles.thumb} ${styles[`thumb_${t.id}`] ?? ''}`}>
                <TemplateThumb templateId={t.id} />
              </div>
              <span className={styles.name}>{t.name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

/** CSS wireframe thumbnails for each template */
function TemplateThumb({ templateId }: { templateId: string }) {
  switch (templateId) {
    case 'classic':
      return (
        <>
          <div className={styles.thTitle} />
          <div className={styles.thSub} />
          <div className={styles.thLine} />
          <div className={`${styles.thLine} ${styles.thLine60}`} />
          <div className={styles.thGap} />
          <div className={styles.thHead} />
          <div className={styles.thLine} />
          <div className={`${styles.thLine} ${styles.thLine60}`} />
        </>
      )
    case 'twocolumn':
      return (
        <div className={styles.thTwocol}>
          <div className={styles.thTcLeft}>
            <div className={styles.thTcBold} />
            <div className={styles.thGap} style={{ height: 4 }} />
            <div className={styles.thTcLight} />
            <div className={styles.thTcLight} />
            <div className={styles.thGap} style={{ height: 4 }} />
            <div className={styles.thTcLight} />
            <div className={styles.thTcLight} />
          </div>
          <div className={styles.thTcRight}>
            <div className={styles.thTcBold} />
            <div className={styles.thTcLight} />
            <div className={`${styles.thTcLight} ${styles.thLine80}`} />
            <div className={styles.thGap} style={{ height: 3 }} />
            <div className={styles.thTcBold} style={{ width: '50%' }} />
            <div className={styles.thTcLight} />
          </div>
        </div>
      )
    case 'modern':
      return (
        <div className={styles.thModern}>
          <div className={styles.thModSide}>
            <div className={styles.thModDot} />
            <div className={styles.thModSideLine} />
            <div className={styles.thModSideLine} />
            <div className={styles.thGap} style={{ height: 4 }} />
            <div className={styles.thModSideLine} />
            <div className={styles.thModSideLine} />
          </div>
          <div className={styles.thModBody}>
            <div className={styles.thTitle} style={{ width: '60%' }} />
            <div className={`${styles.thLine} ${styles.thLine80}`} style={{ height: 1.5 }} />
            <div className={styles.thLine} style={{ height: 1.5 }} />
            <div className={styles.thGap} />
            <div className={styles.thHead} style={{ width: '45%' }} />
            <div className={styles.thLine} style={{ height: 1.5 }} />
          </div>
        </div>
      )
    case 'minimal':
      return (
        <div className={styles.thMinimal}>
          <div className={styles.thTitle} style={{ width: '30%' }} />
          <div className={styles.thGap} style={{ height: 6 }} />
          <div className={styles.thLine} style={{ width: '70%', opacity: 0.4 }} />
          <div className={styles.thLine} style={{ width: '55%', opacity: 0.3 }} />
          <div className={styles.thGap} style={{ height: 8 }} />
          <div className={styles.thLine} style={{ width: '40%', height: 2, opacity: 0.4 }} />
          <div className={styles.thLine} style={{ width: '65%', opacity: 0.3 }} />
        </div>
      )
    case 'academic':
      return (
        <div className={styles.thAcademic}>
          <div className={styles.thTitle} style={{ width: '50%', alignSelf: 'center' }} />
          <div className={styles.thSub} style={{ width: '65%', alignSelf: 'center' }} />
          <div className={styles.thSep} />
          <div className={styles.thLine} style={{ height: 1.5 }} />
          <div className={styles.thLine} style={{ height: 1.5, width: '75%' }} />
          <div className={styles.thGap} />
          <div className={styles.thHead} style={{ width: '40%' }} />
          <div className={styles.thSep} />
          <div className={styles.thLine} style={{ height: 1.5 }} />
        </div>
      )
    default:
      return null
  }
}
```

- [ ] **Step 2: Create TemplatePopover.module.css**

```css
/* src/ui/pages/EditorPage/TemplatePopover.module.css */
/* Template selection popover with thumbnail cards */

.backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(28, 18, 8, 0.15);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s var(--ease-brush-touch);
}

.backdropOpen {
  opacity: 1;
  pointer-events: all;
}

.popover {
  position: fixed;
  top: 52px;
  right: 120px;
  background: var(--sem-bg-primary);
  border: 1px solid var(--color-paper-aged);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(28, 18, 8, 0.15);
  padding: var(--space-4);
  z-index: 201;
  transform: translateY(-8px);
  opacity: 0;
  pointer-events: none;
  transition: all 0.25s var(--ease-ink-spread);
}

.popoverOpen {
  transform: translateY(0);
  opacity: 1;
  pointer-events: all;
}

.title {
  font-family: var(--font-family-body);
  font-size: var(--font-caption);
  color: var(--sem-text-tertiary);
  margin-bottom: var(--space-3);
  letter-spacing: var(--tracking-wide);
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-3);
}

.card {
  cursor: pointer;
  border-radius: 6px;
  padding: var(--space-2);
  text-align: center;
  border: 2px solid transparent;
  background: transparent;
  font-family: var(--font-family-body);
  transition: all var(--duration-fast) var(--ease-brush-touch);
}

.card:hover {
  background: rgba(28, 18, 8, 0.04);
}

.cardActive {
  border-color: var(--sem-action-primary);
  background: rgba(194, 59, 34, 0.04);
}

/* ===== Thumbnail base ===== */

.thumb {
  width: 72px;
  height: 100px;
  background: #fff;
  border: 1px solid var(--color-paper-aged);
  border-radius: 3px;
  margin: 0 auto var(--space-2);
  overflow: hidden;
  box-shadow: var(--shadow-subtle);
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.name {
  font-size: 11px;
  color: var(--sem-text-primary);
  font-weight: var(--weight-bold);
}

/* ===== Thumbnail wireframe elements ===== */

.thLine {
  height: 2px;
  background: var(--color-paper-aged);
  border-radius: 1px;
}

.thLine60 { width: 60%; }
.thLine80 { width: 80%; }

.thTitle {
  width: 45%;
  height: 4px;
  background: var(--sem-text-primary);
  border-radius: 1px;
  margin-bottom: 2px;
}

.thSub {
  width: 55%;
  height: 2px;
  background: var(--sem-text-disabled);
  border-radius: 1px;
  margin-bottom: 4px;
}

.thHead {
  width: 35%;
  height: 3px;
  background: var(--sem-text-secondary);
  border-radius: 1px;
  margin-top: 3px;
}

.thGap { height: 4px; }

.thSep {
  width: 100%;
  height: 1px;
  background: var(--sem-text-primary);
  margin: 3px 0;
  opacity: 0.3;
}

/* Two-column layout */
.thTwocol {
  display: flex;
  gap: 4px;
  height: 100%;
}

.thTcLeft {
  width: 35%;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-right: 1px solid var(--color-paper-aged);
  padding-right: 3px;
}

.thTcRight {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.thTcBold {
  height: 2px;
  background: var(--sem-text-tertiary);
  border-radius: 1px;
  width: 70%;
}

.thTcLight {
  height: 1.5px;
  background: var(--color-paper-aged);
  border-radius: 1px;
}

/* Modern layout */
.thModern {
  display: flex;
  height: 100%;
  gap: 0;
}

.thModSide {
  width: 30%;
  background: var(--sem-text-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 3px;
  gap: 3px;
}

.thModDot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: rgba(245, 237, 214, 0.3);
  margin-bottom: 4px;
}

.thModSideLine {
  height: 1.5px;
  width: 80%;
  background: rgba(245, 237, 214, 0.2);
  border-radius: 1px;
}

.thModBody {
  flex: 1;
  padding: 8px 5px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Minimal layout */
.thMinimal {
  display: flex;
  flex-direction: column;
  padding: 14px 8px;
  gap: 5px;
  height: 100%;
}

/* Academic layout */
.thAcademic {
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: 100%;
}

.thAcademic .thTitle {
  align-self: center;
}

.thAcademic .thSub {
  align-self: center;
}
```

- [ ] **Step 3: Verify the file compiles**

Run: `npx tsc -b --noEmit 2>&1 | head -20`
Expected: May have errors related to `EditorPage.tsx` not yet importing this component — acceptable.

- [ ] **Step 4: Commit**

```bash
git add src/ui/pages/EditorPage/TemplatePopover.tsx src/ui/pages/EditorPage/TemplatePopover.module.css
git commit -m "feat(editor): add TemplatePopover with thumbnail wireframe cards

- 5-column grid with CSS wireframe thumbnails per template
- Backdrop + animated popover (translateY + opacity)
- Active state with vermillion border
- Will be connected in EditorPage rewrite"
```

---

### Task 3: Create AiFab (floating action button)

**Files:**
- Create: `src/ui/pages/EditorPage/AiFab.tsx`
- Create: `src/ui/pages/EditorPage/AiFab.module.css`

**Context:** A round 48px button in the bottom-right of the preview area. Uses obi gradient (indigo). Shows a sun-pattern SVG icon. Has a hover tooltip "AI 智能优化". When the AI drawer is open, the FAB hides with opacity+scale transition.

- [ ] **Step 1: Create AiFab.tsx**

```tsx
// src/ui/pages/EditorPage/AiFab.tsx
// Floating action button for AI — obi indigo gradient
import styles from './AiFab.module.css'

interface AiFabProps {
  visible: boolean
  onClick: () => void
}

export function AiFab({ visible, onClick }: AiFabProps) {
  return (
    <button
      type="button"
      className={`${styles.fab} ${visible ? '' : styles.fabHidden}`}
      onClick={onClick}
      aria-label="AI 智能优化"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.58 4.58l2.12 2.12M17.3 17.3l2.12 2.12M4.58 19.42l2.12-2.12M17.3 6.7l2.12-2.12"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      <span className={styles.tooltip}>AI 智能优化</span>
    </button>
  )
}
```

- [ ] **Step 2: Create AiFab.module.css**

```css
/* src/ui/pages/EditorPage/AiFab.module.css */
/* AI floating action button — obi indigo gradient */

.fab {
  position: absolute;
  bottom: var(--space-6);
  right: var(--space-6);
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--obi-bg-start) 0%, var(--obi-bg-end) 100%);
  color: var(--obi-text);
  border: none;
  box-shadow: 0 4px 12px rgba(44, 53, 72, 0.4), 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s var(--ease-ink-spread);
  z-index: 50;
}

.fab:hover {
  transform: scale(1.08) translateY(-2px);
  box-shadow: 0 8px 24px rgba(44, 53, 72, 0.45), 0 2px 6px rgba(0, 0, 0, 0.12);
}

.fabHidden {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.8);
}

.tooltip {
  position: absolute;
  right: 58px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--obi-bg-start);
  color: var(--obi-text);
  font-family: var(--font-family-body);
  font-size: var(--font-caption);
  padding: 5px 10px;
  border-radius: var(--radius-md);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s var(--ease-brush-touch);
}

.fab:hover .tooltip {
  opacity: 1;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/ui/pages/EditorPage/AiFab.tsx src/ui/pages/EditorPage/AiFab.module.css
git commit -m "feat(editor): add AiFab — obi indigo FAB with sun-pattern icon

- 48px round button, gradient from obi tokens
- Hover: scale + lift + tooltip
- Hidden state for when AI drawer is open"
```

---

### Task 4: Create AiDrawer (chat interface)

**Files:**
- Create: `src/ui/pages/EditorPage/AiDrawer.tsx`
- Create: `src/ui/pages/EditorPage/AiDrawer.module.css`

**Context:** Right-side 340px drawer overlaying the preview area. Obi indigo color scheme. Contains: header with close button, 2x2 quick action grid (hanzi icons), chat message area, suggestion chips, text input bar. Uses the existing `useAiStore` for API key state and optimize calls. Chat messages are component-local state (not persisted).

The drawer replaces the old `AiPanel.tsx` which was a simple options+diff panel. The new drawer adds a chat-like interaction model on top of the existing AI optimize infrastructure.

- [ ] **Step 1: Create AiDrawer.tsx**

```tsx
// src/ui/pages/EditorPage/AiDrawer.tsx
// AI drawer: quick actions + chat + input bar — obi indigo color scheme
import { useState, useCallback, useRef, useEffect, type KeyboardEvent } from 'react'
import { useAiStore } from '@/runtime/store'
import styles from './AiDrawer.module.css'

interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  text: string
}

interface AiDrawerProps {
  open: boolean
  onClose: () => void
  /** Current resume text content for AI optimization */
  content: string
  /** Called when user accepts an AI suggestion */
  onAccept: (optimized: string) => void
}

const QUICK_ACTIONS = [
  { key: 'polish', icon: '润', name: '润色全文', desc: '优化表述，更专业有力', prompt: '帮我润色全文，让表述更专业' },
  { key: 'quantify', icon: '量', name: '量化成果', desc: '模糊描述变可量化指标', prompt: '帮我量化工作成果，添加数据指标' },
  { key: 'concise', icon: '简', name: '精简内容', desc: '去除冗余，控制篇幅', prompt: '帮我精简内容，控制在一页以内' },
  { key: 'match', icon: '适', name: '岗位匹配', desc: '根据目标岗位调整', prompt: '帮我针对目标岗位优化简历' },
] as const

const SUGGESTION_CHIPS = [
  { label: '改写简介', prompt: '帮我改写个人简介' },
  { label: 'STAR 法则', prompt: '用 STAR 法则重写工作经历' },
  { label: '翻译英文', prompt: '翻译为英文' },
]

export function AiDrawer({ open, onClose, content, onAccept }: AiDrawerProps) {
  const { apiKeySet, optimizing, optimize, result, clearResult } = useAiStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // When AI result arrives, add it as a chat message
  useEffect(() => {
    if (result) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'ai', text: result.optimized },
      ])
      onAccept(result.optimized)
      clearResult()
    }
  }, [result, onAccept, clearResult])

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || !content.trim() || optimizing) return

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text },
    ])
    setInputValue('')

    // Map to closest optimize option or default to 'polish'
    const optionMap: Record<string, string> = {
      '润色': 'polish',
      '量化': 'quantify',
      '精简': 'concise',
      '岗位': 'match-job',
    }
    let optionId = 'polish'
    for (const [keyword, id] of Object.entries(optionMap)) {
      if (text.includes(keyword)) {
        optionId = id
        break
      }
    }
    optimize(content, optionId)
  }, [content, optimizing, optimize])

  const handleInputKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      sendMessage(inputValue)
    }
  }, [inputValue, sendMessage])

  return (
    <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`} role="region" aria-label="AI 智能优化">
      <div className={styles.header}>
        <span className={styles.headerTitle}>AI 智能优化</span>
        <button type="button" className={styles.headerClose} onClick={onClose} aria-label="关闭 AI 面板">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {!apiKeySet ? (
        <div className={styles.noKey}>请先在设置中配置 API Key 以启用 AI 功能</div>
      ) : (
        <>
          {/* Quick Actions */}
          <div className={styles.actions}>
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.key}
                type="button"
                className={styles.actionCard}
                onClick={() => sendMessage(a.prompt)}
                disabled={optimizing || !content.trim()}
              >
                <span className={styles.actionIcon}>{a.icon}</span>
                <span className={styles.actionName}>{a.name}</span>
                <span className={styles.actionDesc}>{a.desc}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className={styles.chat} ref={chatRef}>
            {messages.length === 0 ? (
              <div className={styles.chatHint}>点击快捷操作或输入你的需求</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : styles.msgAi}`}>
                  {msg.text}
                </div>
              ))
            )}
            {optimizing && (
              <div className={`${styles.msg} ${styles.msgAi}`}>
                <span className={styles.spinner} /> 正在优化...
              </div>
            )}
          </div>

          {/* Suggestion Chips */}
          <div className={styles.chips}>
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                className={styles.chip}
                onClick={() => sendMessage(chip.prompt)}
                disabled={optimizing || !content.trim()}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className={styles.inputBar}>
            <input
              className={styles.input}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="告诉 AI 你想怎么优化..."
              disabled={optimizing || !content.trim()}
            />
            <button
              type="button"
              className={styles.sendBtn}
              onClick={() => sendMessage(inputValue)}
              disabled={optimizing || !inputValue.trim()}
              aria-label="发送"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create AiDrawer.module.css**

```css
/* src/ui/pages/EditorPage/AiDrawer.module.css */
/* AI drawer — obi indigo color scheme */

.drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 340px;
  background: linear-gradient(180deg, var(--obi-bg-start) 0%, var(--obi-bg-end) 100%);
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.15);
  z-index: 60;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform var(--duration-normal) var(--ease-ink-spread);
}

.drawerOpen {
  transform: translateX(0);
}

/* Vermillion accent line on left edge */
.drawer::before {
  content: '';
  position: absolute;
  left: 0;
  top: var(--space-3);
  bottom: var(--space-3);
  width: 3px;
  background: var(--obi-accent-line);
  border-radius: 0 1.5px 1.5px 0;
}

/* ===== Header ===== */

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px var(--space-4);
  border-bottom: 1px solid var(--obi-border);
}

.headerTitle {
  font-family: var(--font-family-display);
  font-size: 15px;
  font-weight: var(--weight-bold);
  color: var(--obi-text);
}

.headerClose {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--obi-text-muted);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--duration-fast) var(--ease-brush-touch);
}

.headerClose:hover {
  color: var(--obi-text);
}

/* ===== Quick Actions ===== */

.actions {
  padding: var(--space-3) var(--space-4);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
  border-bottom: 1px solid var(--obi-border);
}

.actionCard {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid var(--obi-border);
  background: rgba(58, 69, 96, 0.2);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-family-body);
  color: var(--obi-text);
  transition: all var(--duration-fast) var(--ease-brush-touch);
}

.actionCard:hover:not(:disabled) {
  background: rgba(58, 69, 96, 0.4);
  border-color: rgba(232, 226, 214, 0.2);
}

.actionCard:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.actionIcon {
  display: block;
  font-family: "Noto Serif SC", "Source Han Serif SC", "SimSun", serif;
  font-size: 18px;
  font-weight: var(--weight-bold);
  color: var(--obi-seal);
  opacity: 0.9;
  margin-bottom: var(--space-1);
}

.actionName {
  display: block;
  font-size: 11px;
  font-weight: var(--weight-bold);
  color: var(--obi-text);
  line-height: 1.3;
}

.actionDesc {
  display: block;
  font-size: 9px;
  color: var(--obi-text-muted);
  margin-top: 2px;
  line-height: 1.3;
  opacity: 0.75;
}

/* ===== Chat area ===== */

.chat {
  flex: 1;
  overflow-y: auto;
  padding: 14px var(--space-4);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat::-webkit-scrollbar { width: 3px; }
.chat::-webkit-scrollbar-thumb {
  background: rgba(232, 226, 214, 0.15);
  border-radius: 2px;
}

.chatHint {
  align-self: center;
  font-size: 11px;
  color: var(--obi-text-muted);
  text-align: center;
  padding: 20px 0;
  opacity: 0.6;
}

.msg {
  max-width: 85%;
  padding: 10px 12px;
  border-radius: 10px;
  font-family: var(--font-family-body);
  font-size: 13px;
  line-height: 1.5;
  color: var(--obi-text);
}

.msgAi {
  align-self: flex-start;
  background: rgba(58, 69, 96, 0.35);
  border-bottom-left-radius: 3px;
}

.msgUser {
  align-self: flex-end;
  background: rgba(232, 226, 214, 0.12);
  border-bottom-right-radius: 3px;
}

/* ===== No API key ===== */

.noKey {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  text-align: center;
  font-family: var(--font-family-body);
  font-size: var(--font-small);
  color: var(--obi-text-muted);
}

/* ===== Suggestion Chips ===== */

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 var(--space-4) var(--space-2);
}

.chip {
  padding: 5px 10px;
  border-radius: 12px;
  border: 1px solid var(--obi-border);
  background: transparent;
  color: var(--obi-text-muted);
  font-family: var(--font-family-body);
  font-size: 11px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-brush-touch);
}

.chip:hover:not(:disabled) {
  background: rgba(58, 69, 96, 0.3);
  border-color: rgba(232, 226, 214, 0.25);
  color: var(--obi-text);
}

.chip:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===== Input Bar ===== */

.inputBar {
  padding: 10px 12px;
  border-top: 1px solid var(--obi-border);
  display: flex;
  gap: var(--space-2);
  align-items: center;
  background: rgba(35, 44, 61, 0.5);
}

.input {
  flex: 1;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--obi-border);
  background: rgba(58, 69, 96, 0.25);
  color: var(--obi-text);
  font-family: var(--font-family-body);
  font-size: 13px;
  padding: 0 var(--space-3);
  outline: none;
  transition: border-color 0.2s var(--ease-brush-touch);
}

.input::placeholder {
  color: var(--obi-text-muted);
  opacity: 0.5;
}

.input:focus {
  border-color: rgba(232, 226, 214, 0.3);
}

.input:disabled {
  opacity: 0.5;
}

.sendBtn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: var(--obi-accent-line);
  color: var(--obi-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--duration-fast) var(--ease-brush-touch);
}

.sendBtn:hover:not(:disabled) {
  background: #9a362f;
}

.sendBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== Spinner ===== */

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--obi-border);
  border-top-color: var(--obi-text);
  border-radius: var(--radius-full);
  animation: spin 1s var(--ease-ink-spread) infinite;
  margin-right: var(--space-2);
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/ui/pages/EditorPage/AiDrawer.tsx src/ui/pages/EditorPage/AiDrawer.module.css
git commit -m "feat(editor): add AiDrawer — chat interface with obi indigo theme

- Header with close button, vermillion accent line
- 2x2 quick actions grid with hanzi icons (润/量/简/适)
- Chat message area with user/AI bubbles
- Suggestion chips row
- Text input bar with send button
- Integrates with existing useAiStore"
```

---

### Task 5: Modify ResumePreview (remove export, add shifted prop)

**Files:**
- Modify: `src/ui/pages/EditorPage/ResumePreview.tsx`
- Modify: `src/ui/pages/EditorPage/ResumePreview.module.css`

**Context:** The export PDF button is now in the toolbar (Task 1). The preview canvas needs a `shifted` prop that adds `margin-right: 340px` when the AI drawer is open, so the paper slides left.

- [ ] **Step 1: Modify ResumePreview.tsx — remove export button, add shifted prop**

In `ResumePreview.tsx`, change the interface and component:

```tsx
// src/ui/pages/EditorPage/ResumePreview.tsx
// Resume preview panel — SVG from previewStore
import { useEffect } from 'react'
import type { Resume } from '@/types'
import { usePreviewStore } from '@/runtime/store'
import styles from './ResumePreview.module.css'

interface ResumePreviewProps {
  resume: Resume
  /** Whether the AI drawer is open — shifts canvas left */
  shifted: boolean
}

/** Debounce compile delay (ms) */
const COMPILE_DELAY = 600

export function ResumePreview({ resume, shifted }: ResumePreviewProps) {
  const { svg, error, compiling, compile } = usePreviewStore()

  // Debounced compile trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      compile(resume)
    }, COMPILE_DELAY)

    return () => clearTimeout(timer)
  }, [resume, compile])

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.label}>预览</span>
        {compiling && <span className={styles.status}>编译中...</span>}
      </div>
      <div className={`${styles.canvas} ${shifted ? styles.canvasShifted : ''}`}>
        {error ? (
          <div className={styles.error}>
            <p>渲染失败</p>
            <pre className={styles.errorDetail}>{error}</pre>
          </div>
        ) : svg ? (
          <div
            className={styles.svgPreview}
            // NOTE: This renders Typst-compiled SVG, NOT user/AI-generated content.
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className={styles.placeholder}>
            {compiling ? '正在编译...' : '编辑简历内容以预览'}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add shifted style to ResumePreview.module.css**

Add the `canvasShifted` class after `.canvas`:

```css
.canvasShifted {
  margin-right: 340px;
  transition: margin-right var(--duration-normal) var(--ease-ink-spread);
}
```

Also add a transition on `.canvas`:

```css
.canvas {
  flex: 1;
  overflow: auto;
  padding: var(--space-4);
  display: flex;
  justify-content: center;
  transition: margin-right var(--duration-normal) var(--ease-ink-spread);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/ui/pages/EditorPage/ResumePreview.tsx src/ui/pages/EditorPage/ResumePreview.module.css
git commit -m "refactor(editor): ResumePreview — remove export button, add shifted prop

- Export PDF now lives in TopToolbar only
- shifted prop adds margin-right: 340px for AI drawer
- Smooth transition with ink-spread easing"
```

---

### Task 6: Rewrite EditorPage (new layout + wiring)

**Files:**
- Rewrite: `src/ui/pages/EditorPage/EditorPage.tsx`
- Rewrite: `src/ui/pages/EditorPage/EditorPage.module.css`

**Context:** This is the main integration task. The new layout: TopToolbar -> Workspace (EditorPanel 42% + PreviewPanel 58% with AiDrawer + AiFab). Section cards include hover "AI" buttons. The old AiPanel import is replaced by AiDrawer. The old AnimatePresence-based drawer is replaced by CSS-transition-based AiDrawer.

- [ ] **Step 1: Rewrite EditorPage.tsx**

```tsx
// src/ui/pages/EditorPage/EditorPage.tsx
// Resume editor page — 42/58 split, AI drawer, template popover
import { useEffect, useCallback, useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useResumeStore } from '@/runtime/store'
import { TEMPLATES } from '@/config'
import { CloudEmpty } from '@/ui/components'
import { TopToolbar } from './TopToolbar'
import { TemplatePopover } from './TemplatePopover'
import { SectionEditor } from './SectionEditor'
import { ResumePreview } from './ResumePreview'
import { AiDrawer } from './AiDrawer'
import { AiFab } from './AiFab'
import type { Resume } from '@/types'
import styles from './EditorPage.module.css'

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentResume, loading, openResume, updateCurrentResume, closeResume } = useResumeStore()
  const [aiOpen, setAiOpen] = useState(false)
  const [tplOpen, setTplOpen] = useState(false)

  useEffect(() => {
    if (id) {
      openResume(id)
    }
    return () => {
      closeResume()
    }
  }, [id, openResume, closeResume])

  // Apply template selection from TemplateSelectPage navigation state
  useEffect(() => {
    const state = location.state as { templateId?: string } | null
    if (state?.templateId && currentResume && currentResume.templateId !== state.templateId) {
      updateCurrentResume({ templateId: state.templateId })
      window.history.replaceState({}, '')
    }
  }, [location.state, currentResume, updateCurrentResume])

  const handleUpdate = useCallback(
    (changes: Partial<Resume>) => {
      updateCurrentResume(changes)
    },
    [updateCurrentResume],
  )

  const handleTitleChange = useCallback(
    (title: string) => {
      updateCurrentResume({ title })
    },
    [updateCurrentResume],
  )

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      handleUpdate({ templateId })
    },
    [handleUpdate],
  )

  // Collect resume text content for AI optimization
  const resumeTextContent = useMemo(() => {
    if (!currentResume) return ''
    const parts: string[] = []
    const { personal, education, work, skills, projects } = currentResume
    if (personal.summary) parts.push(personal.summary)
    for (const edu of education) {
      if (edu.description) parts.push(edu.description)
    }
    for (const w of work) {
      if (w.description) parts.push(w.description)
    }
    for (const s of skills) {
      parts.push(`${s.name} (${s.level})`)
    }
    for (const p of projects) {
      if (p.description) parts.push(p.description)
    }
    return parts.join('\n\n')
  }, [currentResume])

  const handleAiAccept = useCallback(
    (optimized: string) => {
      if (!currentResume) return
      updateCurrentResume({
        personal: { ...currentResume.personal, summary: optimized },
      })
    },
    [currentResume, updateCurrentResume],
  )

  const handleToggleAi = useCallback(() => {
    setAiOpen((prev) => !prev)
  }, [])

  const handleCloseAi = useCallback(() => {
    setAiOpen(false)
  }, [])

  // Escape closes AI drawer
  useEffect(() => {
    if (!aiOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAiOpen(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [aiOpen])

  // Resolve current template name
  const currentTemplateName = useMemo(() => {
    if (!currentResume) return ''
    return TEMPLATES.find((t) => t.id === currentResume.templateId)?.name ?? currentResume.templateId
  }, [currentResume])

  // Section AI button handler: open drawer and send section-specific prompt
  const handleSectionAi = useCallback(
    (sectionTitle: string) => {
      setAiOpen(true)
      // The AiDrawer will handle the prompt through its sendMessage mechanism
      // For now, just open the drawer — section-specific prompts are a future enhancement
    },
    [],
  )

  // Loading state
  if (loading || (id && !currentResume)) {
    return (
      <div className={styles.loading}>
        <div className={styles.inkLoader}>
          <span className={styles.inkDot} />
        </div>
        <p>加载中...</p>
      </div>
    )
  }

  if (!currentResume) {
    return (
      <div className={styles.empty}>
        <CloudEmpty
          message="未找到该简历"
          action={{ label: '返回工作台', onClick: () => navigate('/dashboard') }}
        />
      </div>
    )
  }

  const visibleSections = currentResume.sections
    .filter((s) => s.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className={styles.root}>
      <TopToolbar
        title={currentResume.title}
        templateId={currentResume.templateId}
        templateName={currentTemplateName}
        resume={currentResume}
        onTitleChange={handleTitleChange}
        onOpenTemplatePopover={() => setTplOpen(true)}
      />

      <TemplatePopover
        open={tplOpen}
        currentTemplateId={currentResume.templateId}
        onSelect={handleTemplateChange}
        onClose={() => setTplOpen(false)}
      />

      <div className={styles.workspace}>
        {/* Left: Editor (42%) */}
        <main className={styles.editor} role="region" aria-label="简历编辑区">
          <AnimatePresence mode="popLayout">
            {visibleSections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <div className={styles.sectionCard}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{section.title}</h2>
                    {section.type !== 'skills' && (
                      <button
                        type="button"
                        className={styles.sectionAiBtn}
                        onClick={() => handleSectionAi(section.title)}
                        aria-label={`AI 润色${section.title}`}
                      >
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                        </svg>
                        AI 润色
                      </button>
                    )}
                  </div>
                  <SectionEditor
                    type={section.type}
                    resume={currentResume}
                    onUpdate={handleUpdate}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </main>

        {/* Right: Preview (58%) */}
        <aside className={styles.preview} role="region" aria-label="简历预览区">
          <ResumePreview resume={currentResume} shifted={aiOpen} />
          <AiFab visible={!aiOpen} onClick={handleToggleAi} />
          <AiDrawer
            open={aiOpen}
            onClose={handleCloseAi}
            content={resumeTextContent}
            onAccept={handleAiAccept}
          />
        </aside>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite EditorPage.module.css**

```css
/* src/ui/pages/EditorPage/EditorPage.module.css */
/* Editor page — 42/58 split layout */

.root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--sem-bg-primary);
}

/* ===== Workspace: editor + preview ===== */

.workspace {
  display: flex;
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* Editor panel ~42% */
.editor {
  flex: 42;
  min-width: 380px;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: var(--space-4) 18px 80px;
  overflow-y: auto;
  max-height: calc(100vh - 48px);
  background-color: var(--sem-bg-primary);
}

/* Custom thin scrollbar */
.editor::-webkit-scrollbar { width: 4px; }
.editor::-webkit-scrollbar-track { background: transparent; }
.editor::-webkit-scrollbar-thumb { background: rgba(107, 91, 62, 0.2); border-radius: 2px; }
.editor::-webkit-scrollbar-thumb:hover { background: rgba(107, 91, 62, 0.4); }

/* Preview panel ~58% */
.preview {
  flex: 58;
  min-width: 0;
  border-left: 1px solid var(--color-paper-aged);
  max-height: calc(100vh - 48px);
  overflow: hidden;
  position: relative;
}

/* ===== Section cards ===== */

.sectionCard {
  background: #fff;
  border-radius: 6px;
  border: 1px solid rgba(212, 196, 160, 0.5);
  box-shadow: var(--shadow-subtle);
  padding: 14px var(--space-4);
  transition: box-shadow 0.2s var(--ease-brush-touch);
}

.sectionCard:hover {
  box-shadow: var(--shadow-medium);
}

.sectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.sectionTitle {
  font-family: var(--font-family-display);
  font-size: 15px;
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  color: var(--sem-text-primary);
  margin: 0;
  padding-left: 10px;
  border-left: 3px solid var(--sem-action-primary);
}

.sectionAiBtn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  height: 24px;
  padding: 0 var(--space-2);
  border-radius: var(--radius-md);
  border: 1px solid rgba(27, 73, 101, 0.25);
  background: rgba(27, 73, 101, 0.03);
  color: var(--sem-action-ai);
  font-family: var(--font-family-body);
  font-size: 10px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s var(--ease-brush-touch),
              background-color var(--duration-fast) var(--ease-brush-touch);
}

.sectionCard:hover .sectionAiBtn {
  opacity: 1;
}

.sectionAiBtn:hover {
  background: rgba(27, 73, 101, 0.1);
  border-color: rgba(27, 73, 101, 0.4);
}

/* ===== Loading / Empty states ===== */

.loading,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: var(--space-4);
  font-family: var(--font-family-body);
  font-size: var(--font-body);
  color: var(--sem-text-tertiary);
}

/* Ink spread loading animation */
.inkLoader {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
}

.inkDot {
  position: absolute;
  display: block;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background-color: var(--sem-text-tertiary);
  animation: inkSpread 1.2s var(--ease-ink-spread) infinite;
}

.inkDot::before,
.inkDot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: var(--radius-full);
  border: 1px solid var(--sem-text-tertiary);
  animation: inkRipple 1.2s var(--ease-ink-spread) infinite;
}

.inkDot::after {
  inset: -10px;
  animation-delay: 0.2s;
}

@keyframes inkSpread {
  0% { transform: scale(0.2); opacity: 0.8; }
  50% { transform: scale(1); opacity: 0.2; }
  100% { transform: scale(0.2); opacity: 0.8; }
}

@keyframes inkRipple {
  0% { transform: scale(0.6); opacity: 0; }
  30% { opacity: 0.4; }
  100% { transform: scale(1.8); opacity: 0; }
}

/* ===== Responsive ===== */

@media (max-width: 1279px) {
  .editor {
    flex: 50;
    padding: var(--space-4);
  }

  .preview {
    flex: 50;
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit`
Expected: Clean (0 errors). All components now wire together correctly.

- [ ] **Step 4: Run full test suite**

Run: `npm test`
Expected: All existing tests pass.

- [ ] **Step 5: Run lint**

Run: `npm run lint`
Expected: Clean (0 errors).

- [ ] **Step 6: Commit**

```bash
git add src/ui/pages/EditorPage/EditorPage.tsx src/ui/pages/EditorPage/EditorPage.module.css
git commit -m "refactor(editor): rewrite EditorPage — 42/58 split, section AI buttons, new layout

- 42/58 editor/preview split (was 55/45)
- Section cards with hover AI button
- Integrates TemplatePopover, AiDrawer, AiFab
- Removes old AiPanel drawer (AnimatePresence-based)
- Custom thin scrollbar, 48px toolbar height
- Preview shifts when AI drawer opens"
```

---

### Task 7: Delete old AiPanel files

**Files:**
- Delete: `src/ui/pages/EditorPage/AiPanel.tsx`
- Delete: `src/ui/pages/EditorPage/AiPanel.module.css`

**Context:** These files are replaced by `AiDrawer.tsx` and `AiDrawer.module.css`. After Task 6, nothing imports them anymore.

- [ ] **Step 1: Verify no imports remain**

Run: `grep -r "AiPanel" src/`
Expected: No results (all references removed in Task 6).

- [ ] **Step 2: Delete the files**

```bash
rm src/ui/pages/EditorPage/AiPanel.tsx src/ui/pages/EditorPage/AiPanel.module.css
```

- [ ] **Step 3: Verify TypeScript still compiles**

Run: `npx tsc -b --noEmit`
Expected: Clean.

- [ ] **Step 4: Commit**

```bash
git add -u src/ui/pages/EditorPage/AiPanel.tsx src/ui/pages/EditorPage/AiPanel.module.css
git commit -m "chore(editor): remove old AiPanel — replaced by AiDrawer"
```

---

### Task 8: Visual QA and integration verification

**Files:**
- May modify: any of the above files for polish

**Context:** Start the dev server and verify the full flow works end-to-end.

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify EditorPage loads**

Navigate to an existing resume in the browser. Verify:
- Toolbar shows: back + "墨简" + "|" + editable title input | template trigger + "导出 PDF"
- Editor panel is narrower (~42%), preview is wider (~58%)
- Section cards have white background with hover shadow
- Section "AI 润色" buttons appear on hover (not on skills section)
- Scrollbar is thin (4px)

- [ ] **Step 3: Verify template popover**

Click the template trigger button. Verify:
- Backdrop appears
- Popover animates in with 5 template cards
- Each card has a wireframe thumbnail
- Current template has vermillion border
- Clicking a different template selects it and closes popover
- Clicking backdrop closes popover

- [ ] **Step 4: Verify AI FAB + drawer**

Click the indigo FAB in bottom-right. Verify:
- FAB disappears with scale-down animation
- AI drawer slides in from right
- Preview paper shifts left (margin-right)
- Drawer has: header, 4 quick action cards (hanzi icons), chat area, chips, input
- Pressing Escape closes drawer
- FAB reappears when drawer closes
- Preview paper shifts back

- [ ] **Step 5: Verify editable title**

Click the title input. Verify:
- Text is selected on focus
- Dashed underline appears on hover, solid on focus
- Changing text and blurring saves the new title
- Pressing Enter blurs the input

- [ ] **Step 6: Run full checks**

```bash
npx tsc -b --noEmit && npm run lint && npm test
```
Expected: All pass.

- [ ] **Step 7: Final commit if any polish changes were made**

```bash
git add -A
git commit -m "polish(editor): visual QA fixes for EditorPage redesign"
```
