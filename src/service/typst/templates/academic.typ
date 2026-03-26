// 学术风格简历模板
// 衬线字体，经典学术排版
// 数据通过 sys.inputs 传入 JSON 格式

#let data = json.decode(sys.inputs.at("resume-data"))

#set page(
  paper: "a4",
  margin: (top: 2.2cm, bottom: 2.2cm, left: 2.5cm, right: 2.5cm),
)

#set text(
  font: ("Noto Serif SC", "Source Han Serif SC", "SimSun", "Noto Sans SC"),
  size: 10.5pt,
  lang: "zh",
)

#set par(leading: 0.9em, justify: true)

// ─── 辅助函数 ───────────────────────────
#let section-title(title) = {
  v(0.8em)
  text(size: 12pt, weight: "bold", tracking: 0.08em)[
    #smallcaps(title)
  ]
  v(0.15em)
  line(length: 100%, stroke: 0.8pt + luma(60))
  v(0.4em)
}

#let date-range(start, end) = {
  if start != "" or end != "" {
    text(size: 9pt, style: "italic", fill: luma(100))[#start — #end]
  }
}

// ─── 数据提取 ───────────────────────────
#let personal = data.at("personal", default: (:))
#let education = data.at("education", default: ())
#let work = data.at("work", default: ())
#let skills = data.at("skills", default: ())
#let projects = data.at("projects", default: ())
#let section-order = data.at("sectionOrder", default: ("education", "projects", "work", "skills"))

// ─── 姓名与联系信息 ──────────────────────
#align(center)[
  #text(size: 22pt, weight: "bold", tracking: 0.12em)[
    #personal.at("name", default: "")
  ]
  #v(0.3em)
  #if personal.at("title", default: "") != "" {
    text(size: 11pt, style: "italic", fill: luma(60))[#personal.at("title", default: "")]
    v(0.25em)
  }
  #line(length: 40%, stroke: 0.5pt + luma(150))
  #v(0.2em)
  #let contact-items = ()
  #if personal.at("email", default: "") != "" { contact-items.push(personal.email) }
  #if personal.at("phone", default: "") != "" { contact-items.push(personal.phone) }
  #if personal.at("location", default: "") != "" { contact-items.push(personal.location) }
  #if personal.at("website", default: "") != "" { contact-items.push(personal.website) }
  #text(size: 9pt)[#contact-items.join(" | ")]
]

// ─── 个人简介 ───────────────────────────
#if personal.at("summary", default: "") != "" {
  v(0.6em)
  text(size: 10pt, style: "italic")[#personal.at("summary", default: "")]
}

// ─── 按用户排序渲染各模块 ────────────────
#for sec in section-order {
  if sec == "education" and education.len() > 0 {
    section-title("教育背景")
    for item in education {
      grid(
        columns: (1fr, auto),
        [*#item.at("school", default: "")* \ #text(size: 9.5pt)[#item.at("degree", default: "") · #item.at("field", default: "")]],
        align(right, date-range(item.at("startDate", default: ""), item.at("endDate", default: ""))),
      )
      if item.at("description", default: "") != "" {
        v(0.1em)
        text(size: 9.5pt)[#item.description]
      }
      v(0.4em)
    }
  } else if sec == "projects" and projects.len() > 0 {
    section-title("研究与项目")
    for item in projects {
      grid(
        columns: (1fr, auto),
        [*#item.at("name", default: "")* \ #text(size: 9.5pt, style: "italic")[#item.at("role", default: "")]],
        align(right, date-range(item.at("startDate", default: ""), item.at("endDate", default: ""))),
      )
      if item.at("description", default: "") != "" {
        v(0.1em)
        text(size: 9.5pt)[#item.description]
      }
      if item.at("url", default: "") != "" {
        text(size: 8.5pt, fill: rgb("#1B4965"))[#item.url]
      }
      v(0.4em)
    }
  } else if sec == "work" and work.len() > 0 {
    section-title("工作经历")
    for item in work {
      grid(
        columns: (1fr, auto),
        [*#item.at("company", default: "")* \ #text(size: 9.5pt)[#item.at("position", default: "")]],
        align(right, date-range(item.at("startDate", default: ""), item.at("endDate", default: ""))),
      )
      if item.at("description", default: "") != "" {
        v(0.1em)
        text(size: 9.5pt)[#item.description]
      }
      v(0.4em)
    }
  } else if sec == "skills" and skills.len() > 0 {
    section-title("专业技能")
    grid(
      columns: (auto, 1fr),
      gutter: 0.6em,
      ..skills.map(item => {
        (
          text(weight: "bold", size: 9.5pt)[#item.at("name", default: "")],
          text(size: 9pt, fill: luma(100))[#item.at("level", default: "")],
        )
      }).flatten()
    )
  }
}
