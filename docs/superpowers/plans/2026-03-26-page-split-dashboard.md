# Page Split + Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the current HomePage into a pure LandingPage and a new DashboardPage with card-preview resume gallery using an obi (book band) info overlay.

**Architecture:** Rename HomePage → LandingPage (strip resume data), create DashboardPage with responsive card grid + indigo obi overlay. Add localStorage caching for SVG previews and resume progress on compile. Add `getResumeProgress()` to service layer.

**Tech Stack:** React 18, React Router, Zustand, framer-motion, CSS Modules, Vitest

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/service/resume/progress.ts` | `getResumeProgress()` pure function |
| Create | `src/ui/pages/DashboardPage/DashboardPage.tsx` | Dashboard page component |
| Create | `src/ui/pages/DashboardPage/DashboardPage.module.css` | Dashboard styles (grid, obi, cards) |
| Create | `src/ui/pages/DashboardPage/index.ts` | Barrel export |
| Create | `tests/unit/progress.test.ts` | Tests for `getResumeProgress()` |
| Rename | `src/ui/pages/HomePage/` → `src/ui/pages/LandingPage/` | Directory rename |
| Modify | `src/ui/pages/LandingPage/LandingPage.tsx` | Strip resume store, gallery, loading |
| Modify | `src/ui/pages/LandingPage/LandingPage.module.css` | Remove gallery CSS |
| Modify | `src/ui/pages/LandingPage/index.ts` | Update export name |
| Modify | `src/App.tsx` | Route changes: `/` → LandingPage, `/dashboard` → DashboardPage |
| Modify | `src/runtime/store/previewStore.ts` | Cache SVG + progress to localStorage on compile |
| Modify | `src/runtime/store/resumeStore.ts` | Clear cache on delete |
| Modify | `src/ui/pages/EditorPage/TopToolbar.tsx` | Back button → `/dashboard` |
| Modify | `src/ui/pages/EditorPage/EditorPage.tsx` | Back nav → `/dashboard` |
| Modify | `src/ui/tokens/index.css` | Add obi design tokens |
| Modify | `tests/unit/store.test.ts` | Update previewStore tests for caching |
| Modify | `.staging/Mojian-Agent-Lab/tests/unit/store.test.ts` | Mirror test updates |

---

### Task 1: Add `getResumeProgress()` with tests (TDD)

**Files:**
- Create: `src/service/resume/progress.ts`
- Create: `tests/unit/progress.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/progress.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { getResumeProgress } from '@/service/resume/progress'
import type { Resume } from '@/types'

function makeResume(overrides: Partial<Resume> = {}): Resume {
  return {
    id: 'test-1',
    title: 'Test',
    templateId: 'classic',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    personal: { name: '', title: '', email: '', phone: '', location: '', website: '', summary: '' },
    sections: [],
    education: [],
    work: [],
    skills: [],
    projects: [],
    custom: {},
    ...overrides,
  }
}

describe('getResumeProgress', () => {
  it('returns 0/5 for empty resume', () => {
    const result = getResumeProgress(makeResume())
    expect(result).toEqual({ filled: 0, total: 5 })
  })

  it('counts personal as filled when name is non-empty', () => {
    const result = getResumeProgress(makeResume({
      personal: { name: '张三', title: '', email: '', phone: '', location: '', website: '', summary: '' },
    }))
    expect(result).toEqual({ filled: 1, total: 5 })
  })

  it('counts education as filled when array is non-empty', () => {
    const result = getResumeProgress(makeResume({
      education: [{ id: 'e1', school: '北大', degree: '硕士', field: 'CS', startDate: '', endDate: '', description: '' }],
    }))
    expect(result).toEqual({ filled: 1, total: 5 })
  })

  it('returns 5/5 when all sections filled', () => {
    const result = getResumeProgress(makeResume({
      personal: { name: '张三', title: '工程师', email: 'a@b.com', phone: '138', location: '北京', website: '', summary: '' },
      education: [{ id: 'e1', school: '北大', degree: '硕士', field: 'CS', startDate: '', endDate: '', description: '' }],
      work: [{ id: 'w1', company: '字节', position: '前端', startDate: '', endDate: '', description: '' }],
      skills: [{ id: 's1', name: 'React', level: 'expert' }],
      projects: [{ id: 'p1', name: '墨简', role: '开发', startDate: '', endDate: '', description: '', url: '' }],
    }))
    expect(result).toEqual({ filled: 5, total: 5 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/progress.test.ts`
Expected: FAIL — module `@/service/resume/progress` not found

- [ ] **Step 3: Write the implementation**

Create `src/service/resume/progress.ts`:

```typescript
// Service 层：简历填充进度计算
// 依赖：Types

import type { Resume } from '@/types'

export interface ResumeProgress {
  filled: number
  total: number
}

export function getResumeProgress(resume: Resume): ResumeProgress {
  const total = 5
  let filled = 0

  if (resume.personal.name.trim() !== '') filled++
  if (resume.education.length > 0) filled++
  if (resume.work.length > 0) filled++
  if (resume.skills.length > 0) filled++
  if (resume.projects.length > 0) filled++

  return { filled, total }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/progress.test.ts`
Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/service/resume/progress.ts tests/unit/progress.test.ts
git commit -m "feat: add getResumeProgress() with tests"
```

---

### Task 2: Add localStorage caching to previewStore

**Files:**
- Modify: `src/runtime/store/previewStore.ts`
- Modify: `src/runtime/store/resumeStore.ts`

- [ ] **Step 1: Update previewStore to cache SVG and progress on compile**

Edit `src/runtime/store/previewStore.ts`. The `compile` function currently sets `svg` in state. After setting it, also write to localStorage. The compile method needs to accept `Resume` (which it already does), so import `getResumeProgress` and cache both.

Replace the `compile` method body in `previewStore.ts`:

```typescript
// Add import at top of file:
import { getResumeProgress } from '@/service/resume/progress'

// Replace the compile method:
  compile: async (resume) => {
    set({ compiling: true, error: null })
    try {
      const result = await compileToSvg(resume)
      set({ svg: result, compiling: false })

      // Cache SVG preview and progress to localStorage for Dashboard
      try {
        localStorage.setItem(`mojian:preview:${resume.id}`, result)
        const progress = getResumeProgress(resume)
        localStorage.setItem(`mojian:progress:${resume.id}`, JSON.stringify(progress))
      } catch {
        // localStorage full or unavailable — non-critical, skip silently
      }
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Compilation failed',
        svg: null,
        compiling: false,
      })
    }
  },
```

- [ ] **Step 2: Update resumeStore to clear cache on delete**

Edit `src/runtime/store/resumeStore.ts`. In the `deleteResume` method, after `await resumeService.deleteResume(id)`, add cache cleanup:

```typescript
  deleteResume: async (id) => {
    await resumeService.deleteResume(id)
    const { currentResume } = get()
    if (currentResume?.id === id) {
      set({ currentResume: null })
    }

    // Clear cached preview and progress
    try {
      localStorage.removeItem(`mojian:preview:${id}`)
      localStorage.removeItem(`mojian:progress:${id}`)
    } catch {
      // non-critical
    }

    await get().loadResumes()
  },
```

- [ ] **Step 3: Run existing tests**

Run: `npx vitest run tests/unit/store.test.ts`
Expected: All tests PASS (existing tests mock localStorage already)

- [ ] **Step 4: Commit**

```bash
git add src/runtime/store/previewStore.ts src/runtime/store/resumeStore.ts
git commit -m "feat: cache SVG preview and progress to localStorage"
```

---

### Task 3: Add obi design tokens

**Files:**
- Modify: `src/ui/tokens/index.css`

- [ ] **Step 1: Add obi tokens to the end of the `:root` block**

Insert before the `/* ===== 缓动曲线 ===== */` comment in `src/ui/tokens/index.css`:

```css
  /* ===== L3 腰封 (Obi) ===== */
  --obi-bg-start: #2C3548;
  --obi-bg-end: #232C3D;
  --obi-border: #3A4560;
  --obi-text: #E8E2D6;
  --obi-text-muted: rgba(232, 226, 214, 0.6);
  --obi-accent-line: #B8423A;
  --obi-seal: #C4883A;
  --obi-progress-track: rgba(255, 255, 255, 0.1);
  --obi-progress-low: #B8423A;
  --obi-progress-mid: #E8B86D;
  --obi-progress-done: #7DC88B;
```

- [ ] **Step 2: Run lint to verify**

Run: `npx eslint src/ui/tokens/index.css`
Expected: No errors (CSS file)

- [ ] **Step 3: Commit**

```bash
git add src/ui/tokens/index.css
git commit -m "feat: add obi (book band) design tokens"
```

---

### Task 4: Rename HomePage → LandingPage and strip resume data

**Files:**
- Rename: `src/ui/pages/HomePage/` → `src/ui/pages/LandingPage/`
- Modify: `src/ui/pages/LandingPage/LandingPage.tsx` (was `HomePage.tsx`)
- Modify: `src/ui/pages/LandingPage/index.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Rename the directory and files**

```bash
mv src/ui/pages/HomePage src/ui/pages/LandingPage
mv src/ui/pages/LandingPage/HomePage.tsx src/ui/pages/LandingPage/LandingPage.tsx
mv src/ui/pages/LandingPage/HomePage.module.css src/ui/pages/LandingPage/LandingPage.module.css
```

- [ ] **Step 2: Update LandingPage.tsx — strip resume logic, keep hero + features + footer**

Rewrite `src/ui/pages/LandingPage/LandingPage.tsx`:

```tsx
// 落地页：纯品牌展示 + 功能介绍 + CTA
// 不加载任何简历数据
import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
import {
  SealButton,
  InkDivider,
  HeroSection,
  FeatureShowcase,
} from '@/ui/components'
import styles from './LandingPage.module.css'

/* ---- Feature icons ---- */

function BrushIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M36 5 C33 9, 27 17, 24 23 C21 28, 19 33, 20 37 Q21 42, 25 42 Q29 42, 28 36 C27 32, 25 28, 23 26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="21" cy="40" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="17" cy="38" r="1" fill="currentColor" opacity="0.2" />
    </svg>
  )
}

function SealIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect
        x="8" y="8" width="32" height="32"
        stroke="currentColor" strokeWidth="2.5"
        rx="1" fill="none"
        transform="rotate(-2 24 24)"
      />
      <line x1="18" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="18" y1="28" x2="30" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="24" y1="14" x2="24" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    </svg>
  )
}

function ScrollIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M14 7 L34 7 Q37 7, 37 10 L37 38 Q37 43, 32 43 L16 43 Q11 43, 11 38 L11 10 Q11 7, 14 7 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M11 10 Q11 7, 14 7" stroke="currentColor" strokeWidth="2" opacity="0.5" fill="none" />
      <line x1="18" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <line x1="18" y1="22" x2="27" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <line x1="18" y1="28" x2="29" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <line x1="18" y1="34" x2="24" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
    </svg>
  )
}

const FEATURES = [
  {
    icon: <BrushIcon />,
    title: 'AI 润笔',
    description: '以 AI 为墨，润色表述、量化成果、精简内容。一键让每段经历掷地有声。',
  },
  {
    icon: <SealIcon />,
    title: '多款模板',
    description: '经典单栏、双栏、学术风。Typst 排版引擎渲染，如刻版印刷般精准。',
  },
  {
    icon: <ScrollIcon />,
    title: '一键导出',
    description: '所见即所得的实时预览，一键导出 PDF。如同从案头取走一纸文书。',
  },
]

export function LandingPage() {
  const navigate = useNavigate()

  const handleCreate = useCallback(() => {
    navigate('/new')
  }, [navigate])

  const handleDashboard = useCallback(() => {
    navigate('/dashboard')
  }, [navigate])

  return (
    <div className={styles.root}>
      <HeroSection
        title="墨简"
        subtitle="以古人之笔意，书今人之履历。AI 驱动的中古风简历编辑器。"
        action={
          <div className={styles.heroActions}>
            <SealButton onClick={handleCreate}>
              开始创作
            </SealButton>
            <SealButton variant="secondary" onClick={handleDashboard}>
              我的简历
            </SealButton>
          </div>
        }
      />

      <motion.div
        className={styles.sectionBreak}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <motion.div
          className={styles.inkWashLine}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.0, ease: [0.22, 0.61, 0.36, 1], delay: 0.2 }}
        />
      </motion.div>

      <FeatureShowcase features={FEATURES} />

      <footer className={styles.footer}>
        <InkDivider variant="ornamental" className={styles.footerDivider} />
        <p className={styles.footerText}>
          <span className={styles.footerBrand}>墨简 Mojian</span>
        </p>
      </footer>
    </div>
  )
}
```

- [ ] **Step 3: Update LandingPage.module.css — remove gallery/card/loading styles**

Remove everything between `/* ===== Resume Gallery ===== */` and `/* ===== Footer ===== */` (inclusive of gallery styles). Keep: `.root`, `.sectionBreak`, `.inkWashLine`, `.footer*`, media queries for sectionBreak. Add `.heroActions`:

```css
.heroActions {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}
```

- [ ] **Step 4: Update index.ts barrel export**

Write `src/ui/pages/LandingPage/index.ts`:

```typescript
export { LandingPage } from './LandingPage'
```

- [ ] **Step 5: Run tsc to check for errors**

Run: `npx tsc -b --noEmit`
Expected: Errors about `HomePage` import in App.tsx — that's expected, we fix it in the next step.

- [ ] **Step 6: Commit the rename**

```bash
git add src/ui/pages/LandingPage/ src/ui/pages/HomePage/
git commit -m "refactor: rename HomePage → LandingPage, strip resume data"
```

---

### Task 5: Create DashboardPage

**Files:**
- Create: `src/ui/pages/DashboardPage/DashboardPage.tsx`
- Create: `src/ui/pages/DashboardPage/DashboardPage.module.css`
- Create: `src/ui/pages/DashboardPage/index.ts`

- [ ] **Step 1: Create DashboardPage.module.css**

Create `src/ui/pages/DashboardPage/DashboardPage.module.css`:

```css
/* DashboardPage — 简历管理工作台 */
/* 响应式卡片网格 + 腰封信息层 */

.root {
  min-height: 100vh;
  background-color: var(--sem-bg-primary);
}

.topbar {
  max-width: 1080px;
  margin: 0 auto;
  padding: var(--space-10) var(--space-8) 0;
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.title {
  font-family: var(--font-family-display);
  font-size: var(--font-h1);
  font-weight: var(--weight-bold);
  color: var(--sem-text-primary);
  margin: 0;
  letter-spacing: var(--tracking-tight);
}

.count {
  font-family: var(--font-family-body);
  font-size: var(--font-caption);
  color: var(--sem-text-disabled);
  letter-spacing: var(--tracking-wide);
}

/* ===== Card Grid ===== */

.grid {
  max-width: 1080px;
  margin: 0 auto;
  padding: var(--space-8);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
    padding: var(--space-6) var(--space-4);
  }
}

/* ===== New Card (dashed) ===== */

.cardNew {
  aspect-ratio: 210 / 297;
  border: 2px dashed rgba(120, 100, 80, 0.25);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-ink-spread);
  background: rgba(245, 237, 214, 0.4);
}

.cardNew:hover {
  border-color: rgba(120, 100, 80, 0.5);
  background: rgba(245, 237, 214, 0.7);
  transform: translateY(-4px);
}

.cardNew:focus-visible {
  outline: 2px solid var(--sem-focus-ring);
  outline-offset: 2px;
}

.cardNewIcon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(120, 100, 80, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--sem-text-tertiary);
  transition: all var(--duration-normal) var(--ease-ink-spread);
}

.cardNew:hover .cardNewIcon {
  background: rgba(120, 100, 80, 0.15);
  transform: scale(1.1);
}

.cardNewLabel {
  margin-top: var(--space-3);
  font-family: var(--font-family-body);
  font-size: var(--font-body);
  color: var(--sem-text-tertiary);
  letter-spacing: var(--tracking-normal);
}

/* ===== Resume Card ===== */

.card {
  aspect-ratio: 210 / 297;
  border-radius: var(--radius-md);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-ink-spread);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card:focus-visible {
  outline: 2px solid var(--sem-focus-ring);
  outline-offset: 2px;
}

.cardPreview {
  position: absolute;
  inset: 0;
  background: #ffffff;
}

.cardPreview > svg {
  display: block;
  width: 100%;
  height: auto;
}

/* Fallback thumbnail when no cached SVG */
.cardFallback {
  position: absolute;
  inset: 0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sem-text-disabled);
}

/* Delete button — top right, hover only */
.cardDelete {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  border: none;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--duration-fast) ease;
  z-index: 3;
}

.card:hover .cardDelete {
  opacity: 1;
}

.cardDelete:hover {
  background: rgba(184, 66, 58, 0.7);
}

/* ===== Obi (腰封) ===== */

.obi {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 15%;
  z-index: 2;
  padding: var(--space-3) var(--space-4);
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(30, 40, 60, 0.05) 2px,
      rgba(30, 40, 60, 0.05) 4px
    ),
    linear-gradient(180deg, var(--obi-bg-start), var(--obi-bg-end));
  border-top: 1.5px solid var(--obi-border);
  border-bottom: 1.5px solid var(--obi-border);
  box-shadow:
    0 -2px 6px rgba(44, 36, 23, 0.08),
    0 3px 8px rgba(44, 36, 23, 0.1);
  transition: box-shadow var(--duration-normal) var(--ease-ink-spread);
}

.card:hover .obi {
  box-shadow:
    0 -3px 10px rgba(44, 36, 23, 0.1),
    0 5px 14px rgba(44, 36, 23, 0.14);
}

/* Left accent line */
.obi::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background: var(--obi-accent-line);
  border-radius: 0 1.5px 1.5px 0;
}

/* Right seal stamp */
.obi::after {
  content: '简';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%) rotate(-3deg);
  width: 24px;
  height: 24px;
  border: 1.5px solid var(--obi-seal);
  border-radius: 2px;
  font-family: var(--font-family-display);
  font-size: 12px;
  color: var(--obi-seal);
  line-height: 24px;
  text-align: center;
  opacity: 0.45;
}

.obiTitle {
  font-family: var(--font-family-display);
  font-size: 13px;
  font-weight: var(--weight-semibold);
  color: var(--obi-text);
  line-height: var(--leading-tight);
  margin-bottom: 4px;
  margin-left: var(--space-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 36px;
}

.obiMeta {
  font-family: var(--font-family-body);
  font-size: 10px;
  color: var(--obi-text-muted);
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: var(--space-2);
  padding-right: 36px;
}

.obiDot {
  width: 2.5px;
  height: 2.5px;
  border-radius: 50%;
  background: var(--obi-text-muted);
}

.obiProgress {
  margin-top: 6px;
  margin-left: var(--space-2);
  margin-right: 36px;
  height: 2px;
  background: var(--obi-progress-track);
  border-radius: 1px;
  overflow: hidden;
}

.obiProgressFill {
  height: 100%;
  border-radius: 1px;
  transition: width var(--duration-normal) var(--ease-ink-spread);
}

/* ===== Empty state ===== */

.emptyHint {
  grid-column: 2 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  font-family: var(--font-family-body);
  font-size: var(--font-body);
  color: var(--sem-text-disabled);
  text-align: center;
}

/* ===== Loading ===== */

.loading {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-16);
  font-family: var(--font-family-body);
  font-size: var(--font-body);
  color: var(--sem-text-tertiary);
}
```

- [ ] **Step 2: Create DashboardPage.tsx**

Create `src/ui/pages/DashboardPage/DashboardPage.tsx`:

```tsx
// Dashboard 工作台：简历卡片网格 + 腰封信息层
import { useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { TEMPLATES } from '@/config/templates'
import { useResumeStore } from '@/runtime/store'
import type { ResumeProgress } from '@/service/resume/progress'
import type { ResumeSummary } from '@/types'
import styles from './DashboardPage.module.css'

/** Read cached SVG preview from localStorage */
function getCachedSvg(resumeId: string): string | null {
  try {
    return localStorage.getItem(`mojian:preview:${resumeId}`)
  } catch {
    return null
  }
}

/** Read cached progress from localStorage */
function getCachedProgress(resumeId: string): ResumeProgress | null {
  try {
    const raw = localStorage.getItem(`mojian:progress:${resumeId}`)
    if (!raw) return null
    return JSON.parse(raw) as ResumeProgress
  } catch {
    return null
  }
}

/** Get template display name by id */
function getTemplateName(templateId: string): string {
  return TEMPLATES.find((t) => t.id === templateId)?.name ?? templateId
}

/** Format date for display */
function formatDate(ts: number): string {
  const now = new Date()
  const date = new Date(ts)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'

  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) + '日'
}

/** Get progress bar color class based on fill ratio */
function getProgressColor(filled: number, total: number): string {
  const ratio = filled / total
  if (ratio >= 1) return styles.progressDone ?? ''
  if (ratio > 0.4) return styles.progressMid ?? ''
  return styles.progressLow ?? ''
}

/** Single resume card with obi */
function ResumeCard({
  resume,
  index,
  onClick,
  onDelete,
}: {
  resume: ResumeSummary
  index: number
  onClick: () => void
  onDelete: () => void
}) {
  const cachedSvg = useMemo(() => getCachedSvg(resume.id), [resume.id])
  const progress = useMemo(() => getCachedProgress(resume.id), [resume.id])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 0.61, 0.36, 1],
        delay: index * 0.05,
      }}
      layout
    >
      <div
        className={styles.card}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label={`编辑简历：${resume.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        }}
      >
        {/* Preview area */}
        {cachedSvg ? (
          <div
            className={styles.cardPreview}
            dangerouslySetInnerHTML={{ __html: cachedSvg }}
          />
        ) : (
          <div className={styles.cardFallback}>
            <svg viewBox="0 0 24 32" width="48" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="22" height="30" rx="1" stroke="currentColor" strokeWidth="0.8" />
              <line x1="4" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
              <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
              <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
              <line x1="4" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
            </svg>
          </div>
        )}

        {/* Delete button */}
        <button
          type="button"
          className={styles.cardDelete}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label={`删除 ${resume.title}`}
        >
          ×
        </button>

        {/* Obi (book band) */}
        <div className={styles.obi}>
          <div className={styles.obiTitle}>{resume.title}</div>
          <div className={styles.obiMeta}>
            <span>{getTemplateName(resume.templateId)}</span>
            {progress && (
              <>
                <span className={styles.obiDot} />
                <span>{progress.filled}/{progress.total} 已填写</span>
              </>
            )}
            <span className={styles.obiDot} />
            <span>{formatDate(resume.updatedAt)}</span>
          </div>
          {progress && (
            <div className={styles.obiProgress}>
              <div
                className={`${styles.obiProgressFill} ${getProgressColor(progress.filled, progress.total)}`}
                style={{ width: `${(progress.filled / progress.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { resumes, loading, loadResumes, deleteResume } = useResumeStore()

  useEffect(() => {
    loadResumes()
  }, [loadResumes])

  const handleCreate = useCallback(() => {
    navigate('/new')
  }, [navigate])

  const handleOpen = useCallback(
    (id: string) => {
      navigate(`/editor/${id}`)
    },
    [navigate],
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteResume(id)
    },
    [deleteResume],
  )

  // Sort by updatedAt descending
  const sortedResumes = useMemo(
    () => [...resumes].sort((a, b) => b.updatedAt - a.updatedAt),
    [resumes],
  )

  return (
    <div className={styles.root}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>我的简历</h1>
        {!loading && resumes.length > 0 && (
          <span className={styles.count}>{resumes.length} 份</span>
        )}
      </div>

      <div className={styles.grid}>
        {/* New card — always first */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div
            className={styles.cardNew}
            onClick={handleCreate}
            role="button"
            tabIndex={0}
            aria-label="新建简历"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleCreate()
              }
            }}
          >
            <div className={styles.cardNewIcon}>+</div>
            <span className={styles.cardNewLabel}>新建简历</span>
          </div>
        </motion.div>

        {loading ? (
          <div className={styles.loading}>
            <span>载入中...</span>
          </div>
        ) : sortedResumes.length === 0 ? (
          <div className={styles.emptyHint}>
            案头空空，不如落笔。
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {sortedResumes.map((resume, i) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                index={i}
                onClick={() => handleOpen(resume.id)}
                onDelete={() => handleDelete(resume.id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add progress color utility classes to CSS**

Append to `DashboardPage.module.css`:

```css
/* Progress bar color variants */
.progressLow {
  background: var(--obi-progress-low);
}

.progressMid {
  background: var(--obi-progress-mid);
}

.progressDone {
  background: var(--obi-progress-done);
}
```

- [ ] **Step 4: Create barrel export**

Create `src/ui/pages/DashboardPage/index.ts`:

```typescript
export { DashboardPage } from './DashboardPage'
```

- [ ] **Step 5: Run tsc to check types**

Run: `npx tsc -b --noEmit`
Expected: May still fail on App.tsx import — that's Task 6.

- [ ] **Step 6: Commit**

```bash
git add src/ui/pages/DashboardPage/
git commit -m "feat: create DashboardPage with card grid and obi overlay"
```

---

### Task 6: Update routing and navigation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/ui/pages/EditorPage/TopToolbar.tsx`
- Modify: `src/ui/pages/EditorPage/EditorPage.tsx`

- [ ] **Step 1: Update App.tsx routes**

Replace contents of `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router'
import { LandingPage } from '@/ui/pages/LandingPage'
import { DashboardPage } from '@/ui/pages/DashboardPage'
import { EditorPage } from '@/ui/pages/EditorPage'
import { TemplateSelectPage } from '@/ui/pages/TemplateSelectPage'
import '@/ui/tokens/index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/new" element={<TemplateSelectPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 2: Update TopToolbar back navigation**

In `src/ui/pages/EditorPage/TopToolbar.tsx`, change line 27:

```typescript
// Change from:
    navigate('/')
// To:
    navigate('/dashboard')
```

Also update the aria-label on the button from `"返回首页"` to `"返回工作台"`.

- [ ] **Step 3: Update EditorPage back navigation**

In `src/ui/pages/EditorPage/EditorPage.tsx`, find `navigate('/')` (around line 119 in the CloudEmpty action) and change to:

```typescript
    navigate('/dashboard')
```

- [ ] **Step 4: Run full verification**

Run: `npx tsc -b --noEmit && npx eslint src/ && npx vitest run`
Expected: tsc passes, lint passes, tests pass

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/ui/pages/EditorPage/TopToolbar.tsx src/ui/pages/EditorPage/EditorPage.tsx
git commit -m "feat: wire up routes — LandingPage(/), DashboardPage(/dashboard), editor→dashboard"
```

---

### Task 7: Update and fix tests

**Files:**
- Modify: `tests/unit/store.test.ts`
- Modify: `.staging/Mojian-Agent-Lab/tests/unit/store.test.ts`

- [ ] **Step 1: Check if existing store tests still pass**

Run: `npx vitest run tests/unit/store.test.ts`
Expected: Either PASS (localStorage is mocked) or FAIL if the mock doesn't cover `setItem`/`removeItem`

- [ ] **Step 2: Fix store tests if needed**

The existing localStorage mock in `tests/unit/store.test.ts` should already handle `setItem` and `removeItem`. If the `getResumeProgress` import causes issues (since it imports `@/types`), the tests should still work because `compileToSvg` is already mocked and the localStorage calls are in the `try/catch`.

If tests fail, ensure `@/service/resume/progress` is mockable by adding:

```typescript
vi.mock('@/service/resume/progress', () => ({
  getResumeProgress: vi.fn(() => ({ filled: 3, total: 5 })),
}))
```

- [ ] **Step 3: Mirror any test changes to .staging/**

Copy the same changes to `.staging/Mojian-Agent-Lab/tests/unit/store.test.ts`.

- [ ] **Step 4: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 5: Commit if changes were needed**

```bash
git add tests/ .staging/
git commit -m "test: update store tests for localStorage caching"
```

---

### Task 8: Final verification and cleanup

- [ ] **Step 1: Run all checks**

```bash
npx tsc -b --noEmit && npx eslint src/ && npx vitest run
```

Expected: All pass

- [ ] **Step 2: Verify the old HomePage directory is gone**

```bash
ls src/ui/pages/HomePage/ 2>&1
```

Expected: "No such file or directory"

- [ ] **Step 3: Check for any stale imports of HomePage**

```bash
grep -r "HomePage" src/ --include="*.ts" --include="*.tsx"
```

Expected: No matches (all renamed to LandingPage)

- [ ] **Step 4: Final commit if any cleanup was needed**

```bash
git add -A
git commit -m "chore: final cleanup for page split"
```
