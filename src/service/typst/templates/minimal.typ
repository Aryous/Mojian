// 极简模板
// 大量留白，无分隔线，靠字重与灰度建立层次
// 数据通过 sys.inputs 传入 JSON 格式

#let data = json.decode(sys.inputs.at("resume-data"))

#set page(
  paper: "a4",
  margin: (top: 2.4cm, bottom: 2.4cm, left: 2.8cm, right: 2.8cm),
)

#set text(
  font: ("Noto Sans SC", "PingFang SC", "Helvetica Neue", "Arial"),
  size: 9.5pt,
  fill: luma(50),
  lang: "zh",
)

#set par(leading: 0.75em)

// ─── 辅助 ───────────────────────────
#let render-md(s) = {
  if s != "" { eval(s, mode: "markup") }
}

#let section-label(label) = {
  v(1.2em)
  text(size: 7.5pt, weight: "bold", fill: luma(160), tracking: 0.12em)[
    #upper(label)
  ]
  v(0.6em)
}

#let date-range(start, end) = {
  if start != "" or end != "" {
    text(size: 8pt, fill: luma(160))[#start – #end]
  }
}

// ─── 数据 ───────────────────────────
#let personal = data.at("personal", default: (:))
#let education = data.at("education", default: ())
#let work = data.at("work", default: ())
#let skills = data.at("skills", default: ())
#let projects = data.at("projects", default: ())
#let section-order = data.at("sectionOrder", default: ("work", "education", "projects", "skills"))

// ─── 顶部 ───────────────────────────
#text(size: 24pt, weight: "bold", fill: luma(20))[
  #personal.at("name", default: "")
]
#v(0.2em)
#if personal.at("title", default: "") != "" {
  text(size: 10.5pt, fill: luma(100))[#personal.at("title", default: "")]
  v(0.4em)
}

#let contact-items = ()
#if personal.at("email", default: "") != "" { contact-items.push(personal.email) }
#if personal.at("phone", default: "") != "" { contact-items.push(personal.phone) }
#if personal.at("location", default: "") != "" { contact-items.push(personal.location) }
#if personal.at("website", default: "") != "" { contact-items.push(personal.website) }
#if contact-items.len() > 0 {
  text(size: 8.5pt, fill: luma(140))[#contact-items.join("  ·  ")]
}

#if personal.at("summary", default: "") != "" {
  v(1em)
  {
    set text(size: 9.5pt, fill: luma(70))
    render-md(personal.at("summary", default: ""))
  }
}

// ─── 按用户排序渲染各模块 ────────────────
#for sec in section-order {
  if sec == "work" and work.len() > 0 {
    section-label("工作经历")
    for item in work {
      grid(
        columns: (1fr, auto),
        text(size: 10pt, weight: "bold", fill: luma(30))[#item.at("company", default: "")],
        date-range(item.at("startDate", default: ""), item.at("endDate", default: "")),
      )
      text(size: 9pt, fill: luma(100))[#item.at("position", default: "")]
      if item.at("description", default: "") != "" {
        v(0.2em)
        {
          set text(size: 9pt, fill: luma(70))
          render-md(item.at("description", default: ""))
        }
      }
      v(0.7em)
    }
  } else if sec == "education" and education.len() > 0 {
    section-label("教育经历")
    for item in education {
      grid(
        columns: (1fr, auto),
        text(size: 10pt, weight: "bold", fill: luma(30))[#item.at("school", default: "")],
        date-range(item.at("startDate", default: ""), item.at("endDate", default: "")),
      )
      text(size: 9pt, fill: luma(100))[#item.at("degree", default: "") · #item.at("field", default: "")]
      if item.at("description", default: "") != "" {
        v(0.2em)
        {
          set text(size: 9pt, fill: luma(70))
          render-md(item.at("description", default: ""))
        }
      }
      v(0.7em)
    }
  } else if sec == "projects" and projects.len() > 0 {
    section-label("项目经验")
    for item in projects {
      grid(
        columns: (1fr, auto),
        text(size: 10pt, weight: "bold", fill: luma(30))[#item.at("name", default: "")],
        date-range(item.at("startDate", default: ""), item.at("endDate", default: "")),
      )
      if item.at("role", default: "") != "" {
        text(size: 9pt, fill: luma(100))[#item.at("role", default: "")]
      }
      if item.at("description", default: "") != "" {
        v(0.2em)
        {
          set text(size: 9pt, fill: luma(70))
          render-md(item.at("description", default: ""))
        }
      }
      v(0.7em)
    }
  } else if sec == "skills" and skills.len() > 0 {
    section-label("技能")
    for item in skills {
      text(size: 9pt)[*#item.at("name", default: "")* #h(0.5em) #text(fill: luma(140))[#item.at("level", default: "")]]
      h(1.5em)
    }
  }
}
