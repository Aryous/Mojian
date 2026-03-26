// 经典单栏简历模板
// 数据通过 sys.inputs 传入 JSON 格式

#let data = json.decode(sys.inputs.at("resume-data"))

#set page(
  paper: "a4",
  margin: (top: 2cm, bottom: 2cm, left: 2cm, right: 2cm),
)

#set text(
  font: ("Noto Sans SC", "PingFang SC", "Microsoft YaHei"),
  size: 10.5pt,
  lang: "zh",
)

#set par(leading: 0.8em)

// ─── 辅助函数 ───────────────────────────
#let section-title(title) = {
  v(0.6em)
  text(size: 13pt, weight: "bold")[#title]
  v(0.2em)
  line(length: 100%, stroke: 0.5pt + luma(180))
  v(0.3em)
}

#let date-range(start, end) = {
  if start != "" or end != "" {
    text(size: 9pt, fill: luma(120))[#start — #end]
  }
}

// ─── 个人信息 ───────────────────────────
#let personal = data.at("personal", default: (:))

#align(center)[
  #text(size: 20pt, weight: "bold")[#personal.at("name", default: "")]
  #v(0.2em)
  #if personal.at("title", default: "") != "" {
    text(size: 11pt, fill: luma(80))[#personal.at("title", default: "")]
    v(0.2em)
  }
  #let contact-items = ()
  #if personal.at("email", default: "") != "" { contact-items.push(personal.email) }
  #if personal.at("phone", default: "") != "" { contact-items.push(personal.phone) }
  #if personal.at("location", default: "") != "" { contact-items.push(personal.location) }
  #if personal.at("website", default: "") != "" { contact-items.push(personal.website) }
  #text(size: 9pt, fill: luma(100))[#contact-items.join(" · ")]
]

#if personal.at("summary", default: "") != "" {
  v(0.5em)
  text(size: 10pt)[#personal.at("summary", default: "")]
}

// ─── 教育经历 ───────────────────────────
#let education = data.at("education", default: ())
#if education.len() > 0 {
  section-title("教育经历")
  for item in education {
    grid(
      columns: (1fr, auto),
      [*#item.at("school", default: "")* #h(0.5em) #item.at("degree", default: "") · #item.at("field", default: "")],
      date-range(item.at("startDate", default: ""), item.at("endDate", default: "")),
    )
    if item.at("description", default: "") != "" {
      text(size: 9.5pt)[#item.description]
    }
    v(0.3em)
  }
}

// ─── 工作经历 ───────────────────────────
#let work = data.at("work", default: ())
#if work.len() > 0 {
  section-title("工作经历")
  for item in work {
    grid(
      columns: (1fr, auto),
      [*#item.at("company", default: "")* #h(0.5em) #item.at("position", default: "")],
      date-range(item.at("startDate", default: ""), item.at("endDate", default: "")),
    )
    if item.at("description", default: "") != "" {
      v(0.15em)
      text(size: 9.5pt)[#item.description]
    }
    v(0.3em)
  }
}

// ─── 项目经验 ───────────────────────────
#let projects = data.at("projects", default: ())
#if projects.len() > 0 {
  section-title("项目经验")
  for item in projects {
    grid(
      columns: (1fr, auto),
      [*#item.at("name", default: "")* #h(0.5em) #item.at("role", default: "")],
      date-range(item.at("startDate", default: ""), item.at("endDate", default: "")),
    )
    if item.at("description", default: "") != "" {
      v(0.15em)
      text(size: 9.5pt)[#item.description]
    }
    if item.at("url", default: "") != "" {
      text(size: 8.5pt, fill: rgb("#1B4965"))[#item.url]
    }
    v(0.3em)
  }
}

// ─── 技能 ───────────────────────────────
#let skills = data.at("skills", default: ())
#if skills.len() > 0 {
  section-title("技能")
  for item in skills {
    [- *#item.at("name", default: "")* (#item.at("level", default: ""))]
  }
}
