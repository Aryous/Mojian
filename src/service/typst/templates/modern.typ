// 现代模板
// 左侧深色边栏 + 右侧主内容，强调色点缀
// 数据通过 sys.inputs 传入 JSON 格式

#let data = json.decode(sys.inputs.at("resume-data"))

#let accent = rgb("#2563EB")
#let dark-bg = rgb("#1E293B")
#let light-text = rgb("#F1F5F9")
#let muted-text = rgb("#94A3B8")

#set page(
  paper: "a4",
  margin: (top: 0cm, bottom: 0cm, left: 0cm, right: 0cm),
)

#set text(
  font: ("Noto Sans SC", "PingFang SC", "Helvetica Neue", "Arial"),
  size: 9.5pt,
  lang: "zh",
)

#set par(leading: 0.7em)

// ─── 数据 ───────────────────────────
#let personal = data.at("personal", default: (:))
#let education = data.at("education", default: ())
#let work = data.at("work", default: ())
#let skills = data.at("skills", default: ())
#let projects = data.at("projects", default: ())
#let section-order = data.at("sectionOrder", default: ("education", "work", "projects", "skills"))

// ─── 辅助 ───────────────────────────
#let section-heading(label) = {
  v(0.8em)
  text(size: 11pt, weight: "bold", fill: luma(30))[#label]
  v(0.15em)
  box(width: 2em, height: 2pt, fill: accent)
  v(0.5em)
}

#let sidebar-heading(label) = {
  v(1em)
  text(size: 9pt, weight: "bold", fill: light-text, tracking: 0.08em)[#upper(label)]
  v(0.4em)
}

#let date-range(start, end) = {
  if start != "" or end != "" {
    text(size: 8pt, fill: luma(160))[#start – #end]
  }
}

// ─── 布局 ───────────────────────────
#grid(
  columns: (6.4cm, 1fr),
  // === 左侧边栏 ===
  rect(
    width: 100%,
    height: 100%,
    fill: dark-bg,
    inset: (top: 2cm, bottom: 2cm, left: 1.4cm, right: 1.2cm),
  )[
    // 姓名
    #text(size: 22pt, weight: "bold", fill: light-text)[
      #personal.at("name", default: "")
    ]
    #v(0.3em)
    #if personal.at("title", default: "") != "" {
      text(size: 10pt, fill: accent)[#personal.at("title", default: "")]
      v(0.6em)
    }

    // 联系方式
    #sidebar-heading("联系方式")
    #if personal.at("email", default: "") != "" {
      text(size: 8.5pt, fill: muted-text)[#personal.email]
      v(0.3em)
    }
    #if personal.at("phone", default: "") != "" {
      text(size: 8.5pt, fill: muted-text)[#personal.phone]
      v(0.3em)
    }
    #if personal.at("location", default: "") != "" {
      text(size: 8.5pt, fill: muted-text)[#personal.location]
      v(0.3em)
    }
    #if personal.at("website", default: "") != "" {
      text(size: 8.5pt, fill: muted-text)[#personal.website]
      v(0.3em)
    }

    // 技能
    #if skills.len() > 0 {
      sidebar-heading("专业技能")
      for item in skills {
        text(size: 8.5pt, fill: light-text)[#item.at("name", default: "")]
        v(0.15em)
        // 技能条
        box(width: 100%, height: 3pt, fill: rgb("#334155"), radius: 1.5pt)[
          #box(
            width: if item.at("level", default: "") == "expert" { 90% }
                   else if item.at("level", default: "") == "advanced" { 75% }
                   else if item.at("level", default: "") == "intermediate" { 55% }
                   else { 40% },
            height: 3pt,
            fill: accent,
            radius: 1.5pt,
          )
        ]
        v(0.4em)
      }
    }

    // 教育（放在侧栏底部）
    #if education.len() > 0 {
      sidebar-heading("教育背景")
      for item in education {
        text(size: 9pt, weight: "bold", fill: light-text)[#item.at("school", default: "")]
        v(0.15em)
        text(size: 8pt, fill: muted-text)[#item.at("degree", default: "") · #item.at("field", default: "")]
        v(0.1em)
        text(size: 7.5pt, fill: muted-text)[#item.at("startDate", default: "") – #item.at("endDate", default: "")]
        v(0.5em)
      }
    }
  ],

  // === 右侧主内容 ===
  rect(
    width: 100%,
    height: 100%,
    inset: (top: 2cm, bottom: 2cm, left: 1.5cm, right: 1.8cm),
  )[
    // 个人简介
    #if personal.at("summary", default: "") != "" {
      section-heading("个人简介")
      text(size: 9.5pt, fill: luma(60))[#personal.at("summary", default: "")]
    }

    // 按用户排序渲染主区域模块
    #for sec in section-order {
      if sec == "work" and work.len() > 0 {
        section-heading("工作经历")
        for item in work {
          grid(
            columns: (1fr, auto),
            text(size: 10.5pt, weight: "bold", fill: luma(20))[#item.at("company", default: "")],
            date-range(item.at("startDate", default: ""), item.at("endDate", default: "")),
          )
          text(size: 9pt, fill: accent)[#item.at("position", default: "")]
          if item.at("description", default: "") != "" {
            v(0.2em)
            text(size: 9pt, fill: luma(60))[#item.description]
          }
          v(0.7em)
        }
      } else if sec == "projects" and projects.len() > 0 {
        section-heading("项目经验")
        for item in projects {
          grid(
            columns: (1fr, auto),
            text(size: 10.5pt, weight: "bold", fill: luma(20))[#item.at("name", default: "")],
            date-range(item.at("startDate", default: ""), item.at("endDate", default: "")),
          )
          if item.at("role", default: "") != "" {
            text(size: 9pt, fill: accent)[#item.at("role", default: "")]
          }
          if item.at("description", default: "") != "" {
            v(0.2em)
            text(size: 9pt, fill: luma(60))[#item.description]
          }
          v(0.7em)
        }
      }
    }
  ],
)
