// 简历模块编辑器：根据 SectionType 渲染不同表单
import { type ChangeEvent, useCallback } from 'react'
import type {
  Resume,
  SectionType,
  EducationItem,
  WorkItem,
  SkillItem,
  ProjectItem,
} from '@/types'
import { InkInput, SealButton, InkDivider } from '@/ui/components'
import styles from './SectionEditor.module.css'

interface SectionEditorProps {
  type: SectionType
  resume: Resume
  onUpdate: (changes: Partial<Resume>) => void
}

function generateId(): string {
  return crypto.randomUUID()
}

/** 从原生 input change event 提取 value 调用 handler */
function inputHandler(fn: (value: string) => void) {
  return (e: ChangeEvent<HTMLInputElement>) => fn(e.target.value)
}

/** 从原生 textarea change event 提取 value 调用 handler */
function textareaHandler(fn: (value: string) => void) {
  return (e: ChangeEvent<HTMLTextAreaElement>) => fn(e.target.value)
}

// ─── 个人信息 ─────────────────────────────────
function PersonalEditor({ resume, onUpdate }: Omit<SectionEditorProps, 'type'>) {
  const { personal } = resume

  const handleChange = useCallback(
    (field: keyof typeof personal, value: string) => {
      onUpdate({ personal: { ...personal, [field]: value } })
    },
    [personal, onUpdate],
  )

  return (
    <div className={styles.fields}>
      <div className={styles.row}>
        <InkInput label="姓名" hint="如：张三" value={personal.name} onChange={inputHandler((v) => handleChange('name', v))} />
        <InkInput label="职位" hint="如：前端工程师" value={personal.title} onChange={inputHandler((v) => handleChange('title', v))} />
      </div>
      <div className={styles.row}>
        <InkInput label="邮箱" hint="your@email.com" value={personal.email} onChange={inputHandler((v) => handleChange('email', v))} />
        <InkInput label="电话" hint="138-xxxx-xxxx" value={personal.phone} onChange={inputHandler((v) => handleChange('phone', v))} />
      </div>
      <div className={styles.row}>
        <InkInput label="所在地" hint="如：上海" value={personal.location} onChange={inputHandler((v) => handleChange('location', v))} />
        <InkInput label="网站" hint="https://" value={personal.website} onChange={inputHandler((v) => handleChange('website', v))} />
      </div>
      <InkInput label="个人简介" hint="用一两句话介绍自己的核心优势" value={personal.summary} onChange={textareaHandler((v) => handleChange('summary', v))} multiline />
    </div>
  )
}

// ─── 列表型模块通用逻辑 ──────────────────────────

interface ListItemEditorProps<T> {
  items: T[]
  fieldKey: 'education' | 'work' | 'skills' | 'projects'
  onUpdate: (changes: Partial<Resume>) => void
  renderItem: (item: T, onChange: (field: keyof T, value: string) => void) => React.ReactNode
  createEmpty: () => T
  itemLabel: string
}

function ListEditor<T extends { id: string }>({
  items,
  fieldKey,
  onUpdate,
  renderItem,
  createEmpty,
  itemLabel,
}: ListItemEditorProps<T>) {
  const handleItemChange = useCallback(
    (index: number, field: keyof T, value: string) => {
      const updated = [...items]
      updated[index] = { ...updated[index]!, [field]: value }
      onUpdate({ [fieldKey]: updated })
    },
    [items, fieldKey, onUpdate],
  )

  const addItem = useCallback(() => {
    onUpdate({ [fieldKey]: [...items, createEmpty()] })
  }, [items, fieldKey, onUpdate, createEmpty])

  const removeItem = useCallback(
    (index: number) => {
      onUpdate({ [fieldKey]: items.filter((_, i) => i !== index) })
    },
    [items, fieldKey, onUpdate],
  )

  return (
    <div className={styles.listEditor}>
      {items.map((item, index) => (
        <div key={item.id} className={styles.listItem}>
          {renderItem(item, (field, value) => handleItemChange(index, field, value))}
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => removeItem(index)}
            aria-label={`删除${itemLabel}`}
          >
            ×
          </button>
          {index < items.length - 1 && <InkDivider variant="thin" />}
        </div>
      ))}
      <SealButton variant="ghost" onClick={addItem}>
        + 添加{itemLabel}
      </SealButton>
    </div>
  )
}

// ─── 教育经历 ─────────────────────────────────
function EducationEditor({ resume, onUpdate }: Omit<SectionEditorProps, 'type'>) {
  return (
    <ListEditor<EducationItem>
      items={resume.education}
      fieldKey="education"
      onUpdate={onUpdate}
      itemLabel="教育经历"
      createEmpty={() => ({
        id: generateId(),
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        description: '',
      })}
      renderItem={(item, onChange) => (
        <div className={styles.fields}>
          <div className={styles.row}>
            <InkInput label="学校" hint="如：清华大学" value={item.school} onChange={inputHandler((v) => onChange('school', v))} />
            <InkInput label="学位" hint="如：本科" value={item.degree} onChange={inputHandler((v) => onChange('degree', v))} />
          </div>
          <div className={styles.row}>
            <InkInput label="专业" hint="如：计算机科学" value={item.field} onChange={inputHandler((v) => onChange('field', v))} />
            <InkInput label="开始时间" hint="2020-09" value={item.startDate} onChange={inputHandler((v) => onChange('startDate', v))} />
            <InkInput label="结束时间" hint="2024-06" value={item.endDate} onChange={inputHandler((v) => onChange('endDate', v))} />
          </div>
          <InkInput label="描述" hint="GPA、荣誉、相关课程等" value={item.description} onChange={textareaHandler((v) => onChange('description', v))} multiline rows={2} />
        </div>
      )}
    />
  )
}

// ─── 工作经历 ─────────────────────────────────
function WorkEditor({ resume, onUpdate }: Omit<SectionEditorProps, 'type'>) {
  return (
    <ListEditor<WorkItem>
      items={resume.work}
      fieldKey="work"
      onUpdate={onUpdate}
      itemLabel="工作经历"
      createEmpty={() => ({
        id: generateId(),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
      })}
      renderItem={(item, onChange) => (
        <div className={styles.fields}>
          <div className={styles.row}>
            <InkInput label="公司" hint="如：字节跳动" value={item.company} onChange={inputHandler((v) => onChange('company', v))} />
            <InkInput label="职位" hint="如：高级工程师" value={item.position} onChange={inputHandler((v) => onChange('position', v))} />
          </div>
          <div className={styles.row}>
            <InkInput label="开始时间" hint="2022-03" value={item.startDate} onChange={inputHandler((v) => onChange('startDate', v))} />
            <InkInput label="结束时间" hint="至今" value={item.endDate} onChange={inputHandler((v) => onChange('endDate', v))} />
          </div>
          <InkInput label="描述" hint="核心职责与量化成果" value={item.description} onChange={textareaHandler((v) => onChange('description', v))} multiline />
        </div>
      )}
    />
  )
}

// ─── 技能 ─────────────────────────────────────
function SkillsEditor({ resume, onUpdate }: Omit<SectionEditorProps, 'type'>) {
  return (
    <ListEditor<SkillItem>
      items={resume.skills}
      fieldKey="skills"
      onUpdate={onUpdate}
      itemLabel="技能"
      createEmpty={() => ({
        id: generateId(),
        name: '',
        level: 'intermediate' as const,
      })}
      renderItem={(item, onChange) => (
        <div className={styles.row}>
          <InkInput label="技能名称" hint="如：React / Python" value={item.name} onChange={inputHandler((v) => onChange('name', v))} />
          <InkInput label="水平" hint="如：精通 / 熟练" value={item.level} onChange={inputHandler((v) => onChange('level', v))} />
        </div>
      )}
    />
  )
}

// ─── 项目经验 ─────────────────────────────────
function ProjectsEditor({ resume, onUpdate }: Omit<SectionEditorProps, 'type'>) {
  return (
    <ListEditor<ProjectItem>
      items={resume.projects}
      fieldKey="projects"
      onUpdate={onUpdate}
      itemLabel="项目经验"
      createEmpty={() => ({
        id: generateId(),
        name: '',
        role: '',
        startDate: '',
        endDate: '',
        description: '',
        url: '',
      })}
      renderItem={(item, onChange) => (
        <div className={styles.fields}>
          <div className={styles.row}>
            <InkInput label="项目名称" hint="如：智能推荐系统" value={item.name} onChange={inputHandler((v) => onChange('name', v))} />
            <InkInput label="角色" hint="如：技术负责人" value={item.role} onChange={inputHandler((v) => onChange('role', v))} />
          </div>
          <div className={styles.row}>
            <InkInput label="开始时间" hint="2023-01" value={item.startDate} onChange={inputHandler((v) => onChange('startDate', v))} />
            <InkInput label="结束时间" hint="2023-12" value={item.endDate} onChange={inputHandler((v) => onChange('endDate', v))} />
            <InkInput label="链接" hint="https://github.com/..." value={item.url} onChange={inputHandler((v) => onChange('url', v))} />
          </div>
          <InkInput label="描述" hint="项目背景、技术方案与成果" value={item.description} onChange={textareaHandler((v) => onChange('description', v))} multiline />
        </div>
      )}
    />
  )
}

// ─── 主组件 ───────────────────────────────────
export function SectionEditor({ type, resume, onUpdate }: SectionEditorProps) {
  switch (type) {
    case 'personal':
      return <PersonalEditor resume={resume} onUpdate={onUpdate} />
    case 'education':
      return <EducationEditor resume={resume} onUpdate={onUpdate} />
    case 'work':
      return <WorkEditor resume={resume} onUpdate={onUpdate} />
    case 'skills':
      return <SkillsEditor resume={resume} onUpdate={onUpdate} />
    case 'projects':
      return <ProjectsEditor resume={resume} onUpdate={onUpdate} />
    case 'custom':
      return <div className={styles.placeholder}>自定义模块（待实现）</div>
    default:
      return null
  }
}
