# Repository Style Guide

Rules for maintaining this portfolio.

---

## File Naming

- Use **lowercase-kebab-case** for all file names: `rollout-plan.md`, `user-stories.md`
- Project folders use a **2-digit prefix**: `01-`, `02-`, etc. (e.g., `01-ai-gateway/`)
- Writing and blog posts use a **date prefix**: `YYYY-MM-DD-title.md`

## Project Folder Structure

Every project folder **must** contain the following minimum files:

| File | Required | Description |
|---|---|---|
| `README.md` | ✅ Yes | Project overview and navigation |
| `prd.md` | ✅ Yes | Product requirements document |
| `metrics.md` | ✅ Yes | KPIs, OKRs, and measurement plan |
| `decision-log.md` | ✅ Yes | Architecture and product decision records |
| `user-stories.md` | Optional | Detailed user stories and acceptance criteria |
| `architecture.md` | Optional | Technical architecture and system design |
| `rollout-plan.md` | Optional | Phased launch plan with risk register |
| `risks-tradeoffs.md` | Optional | Risk analysis and tradeoff documentation |
| `demo-script.md` | Optional | Walkthrough script for demos or presentations |

Use an `artifacts/` subfolder for diagrams and screenshots.

## Templates

- Templates in `/templates/` are **generic and reusable**
- Copy a template into your project folder and customize it — never edit templates in place
- Remove italicized guidance text after filling in your content

## Diagrams

- Prefer **ASCII art** or **Mermaid** syntax in markdown
- Avoid committing binary images (PNG, JPG) to git unless absolutely necessary
- If binary images are required, place them in the project's `artifacts/` folder

## Links

- Use **relative links** between documents within this repository
- Example: `[See PRD](../01-ai-gateway/prd.md)`

## Writing Style

- Be concise and direct
- Use tables for structured information
- Use bullet points over long paragraphs
- Lead with the most important information

## Commit Messages

Use **conventional commit** format:

| Prefix | Use For |
|---|---|
| `docs:` | Documentation changes (PRDs, case studies, templates) |
| `feat:` | New project artifacts or significant additions |
| `fix:` | Corrections to existing documents |
| `chore:` | Repo maintenance, formatting, reorganization |

Examples:
- `docs: add PRD for AI gateway project`
- `feat: add cost segregation case study`
- `fix: correct metrics targets in 01-ai-gateway`
- `chore: reorganize templates folder`
