# Demo Script: AI Gateway Governance Prototype

**Duration:** 5 minutes  
**Audience:** Stakeholders, design partners, leadership  
**Prototype URL:** http://localhost:3000  
**Repository:** [github.com/anishtallapureddy/anish-projects/ai/ai-gateway](https://github.com/anishtallapureddy/anish-projects/tree/main/ai/ai-gateway)

---

## Pre-Demo Setup

- [ ] Prototype running locally (`npm start` → http://localhost:3000)
- [ ] Browser open with prototype loaded
- [ ] Screen resolution set for clear readability (1280×800 or higher)
- [ ] Demo data pre-populated (models, tools, agents registered)
- [ ] Notes/script visible on second screen or printed

---

## Act 1: Opening — The Problem (0:00–0:30)

### What to Say

> "Enterprises adopting AI today are deploying dozens of models, connecting hundreds of tools, and building autonomous agents — but there's no unified way to govern all of this.
>
> Platform engineers are managing quotas in one portal, tool access in another, and agent behavior through custom scripts. Developers can't discover what's available or what policies apply.
>
> What if governance for models, tools, and agents was built right into the platform where you build AI?"

### What to Show

- **Stay on the landing page** of the prototype
- Point to the navigation: **Operate** (admin) and **Build** (developer) tabs
- Gesture at the three pillars visible: Models, Tools, Agents

> 💡 **Speaker Note:** Keep this brief — the problem should resonate immediately. Don't dwell; move to the demo.

---

## Act 2: Operate — Models Governance (0:30–1:30)

### What to Say

> "Let's start with the platform engineer view. I'm in the **Operate** tab — this is where admins govern AI resources."

### What to Click/Show

1. **Click Operate → Models** in the navigation
2. **Show the registered models list**
   - Point out: GPT-4o, GPT-4o-mini, Claude 3.5, a self-hosted Llama model
   - Highlight: "Notice we have both Azure OpenAI models and external models — all governed in one place"

3. **Click on GPT-4o** to open model details

4. **Show Quota Governance**
   - Point to RPM/TPM settings: "We can set rate limits per model — 1000 requests per minute, 100K tokens per minute"
   - Point to per-consumer quotas: "And per-team quotas so no single consumer exhausts capacity"

5. **Show Virtual Keys**
   - Point to virtual key list: "Developers get virtual keys — they never see the raw Azure OpenAI credentials"
   - Show key status (active, rotated): "Full lifecycle management — generate, rotate, revoke"

6. **Show High Availability / Failover**
   - Point to primary + fallback configuration: "GPT-4o primary is East US; if it fails, traffic automatically routes to West US"
   - Point to load balancing mode: "Round-robin for load distribution, or priority-based for failover"

> 💡 **Speaker Note:** Emphasize "unified governance" — models from any provider, managed in one place with consistent policies.

---

## Act 3: Operate — Tools (MCP) Governance (1:30–2:30)

### What to Say

> "Now let's look at **Tools governance** — this is the MCP layer. Organizations have APIs and services they want agents to use, but they need to govern access."

### What to Click/Show

1. **Click Operate → Tools** in the navigation

2. **Show Registered MCP Endpoints**
   - Point to the list: HR Tools, Finance Tools, Engineering Tools
   - Highlight namespaces: "`hr/`, `finance/`, `engineering/` — organized by business domain"

3. **Click "Register New Tool"** (or equivalent button)
   - Walk through the registration form:
     - MCP Server URL: `https://hr-tools.contoso.com/mcp`
     - Namespace: `hr`
     - Auth method: OAuth 2.0
     - Description: "HR employee lookup and org chart tools"
   - "Registration validates the endpoint and pulls the tool schema automatically"

4. **Show Namespace Configuration**
   - Click on the `hr/` namespace
   - Point to namespace-level policies: rate limits, allowed consumers, approval required
   - "Policies apply to all tools in the namespace — you don't configure each tool individually"

5. **Show Approval Queue**
   - Navigate to approval queue
   - Show a pending tool submission: "A developer submitted an external API for conversion to MCP"
   - **Click Approve**: "Now it's live in the catalog for developers to discover"

> 💡 **Speaker Note:** The approval workflow is a big differentiator for enterprise customers. Emphasize the balance between developer self-service and admin governance.

---

## Act 4: Operate — Agents Governance (2:30–3:15)

### What to Say

> "Finally, **Agents governance**. Agents are the newest — and most complex — part of the AI estate. Let me show you how we bring them under governance."

### What to Click/Show

1. **Click Operate → Agents** in the navigation

2. **Show Registered Agents**
   - Point to the list: "We have platform-native agents, a LangChain agent, and an AutoGen agent — all registered"
   - Highlight the source column: "Platform, External, Vertex AI"

3. **Click "Register External Agent"**
   - Walk through: name, endpoint URL, framework (LangChain), capabilities
   - "External agents get the same governance as platform-native ones"

4. **Show Cross-Cloud Sync**
   - Point to the Vertex AI sync status: "We sync agent registrations from Google Vertex AI"
   - Show last sync timestamp and agent count
   - "Multi-cloud visibility — your entire agent estate in one place"

5. **Briefly show guardrail configuration** (if time permits)
   - Point to input/output filters and tool access restrictions per agent

> 💡 **Speaker Note:** Cross-cloud sync gets strong reactions. If time is tight, prioritize showing the external agent registration and cloud sync over guardrails.

---

## Act 5: Build — Developer Experience (3:15–4:15)

### What to Say

> "Now let's switch to the **developer perspective**. I'm in the **Build** tab — this is what developers and agent builders see."

### What to Click/Show

1. **Click Build → Tool Catalog** in the navigation

2. **Show the Tool Catalog**
   - Point to the searchable list of governed tools
   - Type a search query (e.g., "employee"): "Developers search by keyword to find relevant tools"
   - Show search results with tool name, namespace, description, and schema

3. **Click on a tool** (e.g., `hr/lookup_employee`)
   - Show the tool detail: description, input schema, output schema, usage example
   - "Auto-generated documentation from the MCP schema"

4. **Build a Toolbox**
   - Click "Add to Toolbox" on 2–3 tools
   - Navigate to "My Toolbox": "Developers curate a toolbox — the set of tools their agent will use"
   - Show the toolbox with selected tools

5. **Test in Playground**
   - Click "Test" on `hr/lookup_employee`
   - Enter sample input: `{ "employee_id": "12345" }`
   - Click "Invoke": Show the tool response
   - "The request goes through the gateway — all governance policies apply, even in the playground"

> 💡 **Speaker Note:** The "Add to Toolbox" → "Test in Playground" flow is the key developer journey. Make it feel smooth and fast. If the audience is developer-heavy, spend more time here.

---

## Act 6: Monitor — Metrics & Logs (4:15–4:45)

### What to Say

> "Everything that flows through the gateway is observable. Let me show you the **monitoring dashboard**."

### What to Click/Show

1. **Click the Monitor section** (or dashboard tab)

2. **Show the Overview Dashboard**
   - Point to key metrics: total requests (24h), models/tools/agents active, error rate, blocked %
   - "At a glance — the health of your entire AI estate"

3. **Show Request Logs**
   - Point to the request log table: timestamp, resource, consumer, status, latency, policies applied
   - Click on a specific request to show details
   - "Full traceability — every request, every policy evaluation, every failover"

4. **Briefly show a chart** (latency trend or request volume)
   - "Trends over time help you right-size quotas and identify issues"

> 💡 **Speaker Note:** Don't linger on monitoring — it's supporting evidence, not the main story. 30 seconds is enough.

---

## Act 7: Close — Value Recap (4:45–5:00)

### What to Say

> "So what did we just see?
>
> **One gateway** for models, tools, and agents — built right into the AI Gateway platform.
>
> **Platform engineers** get unified governance: quotas, virtual keys, failover, approval workflows, namespace-based tool organization, agent guardrails, and cross-cloud visibility.
>
> **Developers** get a frictionless experience: discover in the catalog, build a toolbox, test in the playground, ship with confidence.
>
> **Everything is observable** — every request, every policy, every failover event.
>
> This is AI governance that doesn't slow you down — it speeds you up."

### What to Show

- Return to the **landing page** or show a summary slide
- Leave the prototype visible for Q&A

> 💡 **Speaker Note:** End confidently. The last sentence should land. Pause briefly, then open for questions.

---

## Q&A Prep — Anticipated Questions

| Question | Suggested Answer |
|----------|-----------------|
| "How does this relate to existing APIM?" | "APIM is the engine under the hood. We're surfacing its AI Gateway capabilities directly in the AI Gateway dashboard so customers don't need to learn APIM." |
| "What about pricing?" | "We're exploring consumption-based pricing aligned with APIM. Design partners will help us validate the model." |
| "When does this ship?" | "Private preview with Models governance in Q1–Q2 2025. Tools in Q2–Q3. Full GA with Agents in Q3–Q4." |
| "Does this work with non-Azure models?" | "Yes — you can register any model endpoint. We showed a self-hosted Llama model alongside Azure OpenAI." |
| "What if I don't use MCP?" | "You can import OpenAPI specs and we convert them to MCP tools automatically. Existing REST APIs work." |
| "What about latency?" | "The gateway adds <15ms at P50 and <50ms at P99. We measure this continuously and it's a hard constraint." |
| "How is this different from LangSmith / Portkey / etc.?" | "Those are observability-first tools. This is governance-first — built into the platform with policy enforcement, not just monitoring." |

---

## Demo Recovery Tips

| Issue | Recovery |
|-------|---------|
| Prototype not loading | Have screenshots ready as backup; explain this is a local prototype |
| Slow response | "This is running locally — in production, the gateway adds <50ms" |
| Data looks wrong | "This is mock data for the prototype — let me show you the flow" |
| Feature not working | Skip to next section; note it for follow-up |
| Running over time | Skip Act 4 (Agents) or Act 6 (Monitor) — they're the most cuttable |

---

*Related: [README](./README.md) · [PRD](./prd.md) · [Rollout Plan](./rollout-plan.md)*
