# Interview Guide: Tool Catalog Discovery Research

**Research Lead:** Anish · **Study Duration:** 3 weeks · **Method:** Semi-structured interviews (45 min each)

---

## Research Objectives

1. **Map the current tool-discovery workflow** — How do agent builders find, evaluate, and connect to enterprise tools today? Where does the process break?
2. **Identify governance gaps** — What controls (or lack thereof) exist around agent-tool access? What keeps security teams up at night?
3. **Validate catalog value proposition** — Would a governed, searchable catalog change behavior? What would make teams actually use it vs. falling back to Slack-and-ask?
4. **Surface trust signals** — What information do builders need to decide whether a tool is safe and reliable enough for a production agent?

---

## Participant Segments

### Segment A: Agent Builders (5 participants)

Software engineers and AI engineers actively building agents on Azure (OpenAI + Semantic Kernel, AutoGen, or LangChain).

**Recruiting criteria:**
- Built or maintained ≥1 production agent in the last 6 months
- Agent uses ≥3 external tools (APIs, MCP servers, functions)
- Mix of large enterprise (≥10K employees) and mid-market (1K–10K)

### Segment B: Platform Engineers / Admins (4 participants)

Engineers responsible for managing API infrastructure, MCP server deployments, or developer platform tooling.

**Recruiting criteria:**
- Manages ≥20 APIs or tool endpoints for their organization
- Uses Azure API Management, Azure API Center, or equivalent
- Responsible for onboarding teams to internal tools

### Segment C: Security & Compliance (3 participants)

Security architects or compliance officers involved in governing AI/agent deployments.

**Recruiting criteria:**
- Involved in AI governance policy for their organization
- Familiar with SOC 2, ISO 27001, or industry-specific compliance
- Has reviewed or restricted agent access to internal systems

---

## Interview Questions

### Theme 1: Discovery — How Tools Are Found Today

1. Walk me through the last time you needed to find an internal tool or API for an agent. What did you do first?
2. How do you currently know what tools are available in your organization? Where is that information?
3. Have you ever built something that already existed elsewhere in your org? How did you find out?
4. If you could search for tools the way you search for packages on npm, what would you type?

**Probing follow-ups:**
- "You mentioned Slack — how often does that actually lead to the right tool?"
- "What happened when you couldn't find a tool? Did you build, buy, or give up?"

### Theme 2: Evaluation — How Tool Quality Is Assessed

5. When you find a candidate tool, how do you decide whether to trust it for a production agent?
6. What information do you wish you had about a tool before integrating it?
7. Have you ever connected an agent to a tool that turned out to be unreliable? What happened?
8. How important is it to see who else is using a tool — and how they're using it?

**Probing follow-ups:**
- "If you had a quality score from 1-5, what would go into that score?"
- "Would you trust a tool more if a platform team curated it vs. self-published?"

### Theme 3: Connection — The Integration Experience

9. Describe the steps to connect your agent to a new tool today. Where are the pain points?
10. How do you handle authentication when your agent connects to a tool? Who provisions the credentials?
11. When a tool changes its schema or endpoint, how do you find out?

**Probing follow-ups:**
- "How long does the end-to-end process take — from 'I need this tool' to 'my agent calls it in production'?"
- "What would cut that time in half?"

### Theme 4: Governance — Control and Visibility

12. Who in your org decides which tools an agent is allowed to use? Is there a formal process?
13. Can you audit which agents are connected to which tools today? How?
14. If a tool is decommissioned or has a security incident, how would you find all agents using it?
15. What governance controls would you need to feel comfortable letting teams self-serve tool connections?

**Probing follow-ups:**
- "If there were an approval workflow, who should approve and what's an acceptable wait time?"
- "What would make you confident enough to allow auto-approval for low-risk tools?"

---

## Artifacts to Collect

| Artifact | Purpose |
|----------|---------|
| Current tool inventory (if any) | Understand baseline documentation maturity |
| Screenshots of internal wikis/Confluence pages listing tools | See how discovery is done today |
| Agent architecture diagrams | Map tool dependencies and integration patterns |
| Sample access-request workflows (ServiceNow, Jira) | Understand current governance overhead |
| Org chart / team structure for tool ownership | Map stakeholder landscape |

---

## Analysis Framework

### Affinity Mapping

Group observations into themes using a digital whiteboard (Miro). Code each observation with:
- **Participant ID** (A1–A5, B1–B4, C1–C3)
- **Segment** (Builder / Platform / Security)
- **Emotion** (Frustrated / Neutral / Positive)
- **Frequency** (One-off / Recurring / Systemic)

### Insight Synthesis

For each cluster, articulate:
1. **Observation** — What we saw or heard
2. **Interpretation** — Why it matters
3. **Evidence strength** — Strong (≥6 participants), Moderate (3–5), Emerging (1–2)
4. **Implication** — What it means for the product

### Opportunity Scoring

Score each opportunity on:
- **Reach** — How many users it affects (1–5)
- **Impact** — How much it reduces friction (1–5)
- **Confidence** — How strong the evidence is (1–5)
- **Effort** — How hard it is to build (1–5, inverse)

Use RICE framework: (Reach × Impact × Confidence) / Effort

---

*Part of [Anish's PM Portfolio](../../README.md)*
