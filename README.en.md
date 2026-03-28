English | [中文](README.md)

# Mojian

AI-powered resume editor with classical Chinese aesthetics.

Rice paper, ink stone, seals, lattice windows — resumes built with traditional Chinese design elements. Built-in AI polish, real-time Typst rendering, multiple templates.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Rendering**: Typst (browser-side compilation, live preview)
- **AI**: Multi-provider support (OpenRouter / direct), unified provider entry point
- **Architecture**: Six-layer separation (Types → Config → Repo → Service → Runtime → UI), enforced by custom ESLint rules

## Project Structure

```
src/
├── types/          Type definitions
├── config/         AI provider, template, theme configuration
├── repo/           Resume persistence, template storage
├── service/        AI service, Typst rendering, export
├── runtime/        State management, events, routing
└── ui/             Pages, components, design tokens
    ├── tokens/     Classical Chinese design tokens
    ├── components/ Atomic components
    ├── patterns/   Composite patterns
    └── pages/      Page views

docs/               Contract documents (requirements, design, tech decisions, exec plans)
.claude/            Harness framework (agent definitions, scripts, rules)
```

## Getting Started

Requires Node.js >= 18.

```bash
git clone https://github.com/Aryous/Mojian.git
cd Mojian
npm install
npm run dev
```

Open `http://localhost:5173`. Enter your OpenRouter API Key in settings to enable AI features.

The editor works without an API Key — you can edit and preview resumes normally.

### Other Commands

```bash
npm run build        # Production build
npm run lint         # ESLint (includes layer rules)
npm test             # Run tests
```

## Harness

This project uses an agent-driven engineering framework:

- 7 specialized agents (requirements, architecture, tech decisions, design, planning, implementation, doc-fix)
- Pipeline gates (entry/exit conditions at each stage)
- Trace coverage (code `@req` annotations traced back to requirements)
- Exemption state machine (controlled exception path for legacy debt)

The framework has been extracted as a standalone project: [HarnessPractice](https://github.com/Aryous/HarnessPractice)

## License

MIT

