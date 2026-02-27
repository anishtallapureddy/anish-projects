# How I Aligned 5 Teams to Ship AI Gateway Governance

**Author:** Anish Tallapureddy
**Role:** Principal PM — Group Product Lead, Azure API Management / AI Gateway — Microsoft
**Timeline:** ~3 weeks from first conversation to aligned investment commitment
**Skill Demonstrated:** Cross-organizational influence, stakeholder alignment, prototype-driven product strategy

---

> *"The hardest part of building a platform product isn't the technology —
> it's getting five teams to agree that the problem is worth solving together."*

---

## Situation

By mid-2024, every enterprise customer I spoke to was asking the same question: *"How do I govern AI usage across my organization?"* They had models deployed through Azure AI Services, developers building in Azure AI Foundry, and API Management handling their traditional API traffic — but no single pane of glass for AI governance. The pain was real and growing: one financial services customer told me they had 47 different GPT-4 deployments across six teams, with no centralized visibility into cost, usage, or compliance posture. A healthcare company was blocking AI adoption entirely because they couldn't prove governance controls to their compliance team. Each team inside Microsoft had built a piece of the answer. APIM had powerful gateway policies for rate limiting and authentication. The AI platform team had the developer-facing Build experience. Azure AI Services owned model deployments and inference endpoints. The MCP Runtime team was building the emerging standard for tool interoperability. Security had frameworks for credential management and access control. But nobody owned the unified story of *operate and govern your AI estate*.

I saw the opportunity sitting in the gap between these teams. APIM's gateway runtime — battle-tested at enterprise scale — could power a governance layer for AI workloads. The AI Gateway dashboard could surface that governance to the developers and platform teams who actually needed it. But connecting these capabilities required something no single team was chartered to do: build a cross-cutting experience that spanned five organizations, each with their own roadmap, leadership, and incentive structure. I'd spent the previous quarter building relationships with each of these teams through design reviews and customer call shadowing, so I had context on their priorities and constraints. That context became the foundation for the alignment work that followed.

---

## The Challenge

The core difficulty wasn't technical — it was organizational. Each of the five teams had legitimate concerns about this initiative, and each had something real at stake. Dismissing those concerns would have killed alignment before it started.

| Team | Primary Concern | What They Stood to Gain | What They Stood to Lose |
|------|----------------|------------------------|------------------------|
| **APIM** | AI Gateway is a new workload pattern that could fragment the core API Management product | Massive new enterprise workload flowing through APIM runtime; relevance in the AI era | Control over how APIM is positioned; risk of becoming "just the runtime" behind the AI Gateway |
| **Gateway UX** | Adding an "Operate" tab introduces scope and complexity to an already ambitious dashboard | Complete developer lifecycle (Build → Operate) makes the AI Gateway stickier and more differentiated | Sprint capacity — every Operate feature competes with Build features for engineering time |
| **Azure AI Services / OpenAI** | A gateway layer between customers and models could add latency and obscure model-level diagnostics | Better enterprise adoption of their models (governance unlocks regulated industries) | Visibility into model performance if the gateway layer becomes an opaque intermediary |
| **MCP Runtime** | Tool governance via gateway could slow down MCP adoption by adding friction to tool registration | Instant distribution channel — every AI Gateway customer gets MCP tool governance built-in | Adoption velocity if governance workflows make tool onboarding feel heavy |
| **Security & Compliance** | Virtual keys, tool approval workflows, and cross-cloud agent sync each introduce new attack surfaces | A governed-by-default AI platform is exactly what enterprise security teams are asking for | Accountability — if any of these new surfaces are breached, Security owns the incident response |

The temptation was to write a 40-page PRD, get executive sponsorship, and drive alignment top-down. I chose a different path.

In my experience, top-down mandates create compliance, not commitment. Teams do the minimum required work, and the initiative becomes "that thing leadership told us to do" rather than something each team owns. I needed genuine buy-in — the kind where each team sees the initiative as advancing *their* goals, not just mine.

---

## My Approach: Prototype-First Alignment

### Start with a Demo, Not a Deck

I didn't write a PRD. I didn't build a slide deck. I built a working prototype.

Over the course of a few days, I stood up the AI Gateway dashboard — a Node.js + Express application with an HTML frontend that simulated the governance experience end to end. It wasn't production code. It was a functional demo that showed real gateway policy enforcement, a model catalog with usage analytics, a tool registry with approval workflows, and virtual key management — all rendered in a UI that mapped to the AI Gateway's design language.

The prototype had four core screens:
- **Model Governance Dashboard** — showing all deployed models across an AI Gateway project, with per-model token usage, cost attribution, latency percentiles, and policy enforcement status
- **Tool Catalog** — a searchable registry of MCP-compatible tools with approval status, usage metrics, and one-click connection to agent workflows
- **Virtual Key Management** — create, scope, rotate, and revoke developer keys with granular permissions tied to specific models and tools
- **Policy Configuration** — visual editor for gateway policies (rate limiting, content filtering, token quotas) that generated APIM policy XML under the hood

The prototype was deliberately concrete. Abstract strategy decks let people project their own fears onto your proposal. A working demo forces a different conversation: *"Here's what it actually looks like. What would you change?"*

### Customized Walkthroughs for Each Team

I didn't do a single all-hands presentation. I walked each team through the prototype individually, tailored to what they cared about most. Each walkthrough was 60 minutes: 20 minutes of demo, 40 minutes of discussion. I scheduled them across five consecutive days so I could iterate the prototype between each session based on the feedback I received.

**With the APIM team**, I showed how every governance action in the UI — rate limiting, content filtering, token quotas — mapped directly to existing APIM gateway policies. No new runtime required. The demo made it viscerally clear that this experience *elevated* APIM's capabilities rather than hiding them. I showed the policy configuration panel and how it surfaced APIM concepts (products, subscriptions, policies) in AI-native language that platform engineers would immediately understand. I also showed how every API call from the gateway governance UI hit APIM management APIs — reinforcing that APIM was the engine, not just the plumbing.

**With the Gateway UX team**, I showed how the Operate tab architecture was a structural mirror of their existing Build tab. Same navigation patterns, same resource scoping, same design components. I'd intentionally built the prototype using their design system tokens so the Operate tab felt like a natural extension, not an alien bolt-on. The conversation shifted from "this is a new surface to maintain" to "this completes the story we're already telling." The Gateway UX PM's exact words were: *"We've been wondering what the right-hand side of the Build experience should be. This is it."*

**With Azure AI Services**, I addressed latency head-on. The prototype included a diagnostics view showing per-model latency with and without the gateway layer. The overhead was under 50ms — negligible for enterprise workloads where governance is a hard requirement. More importantly, I showed how the gateway's observability layer actually *improved* model-level diagnostics by correlating inference calls with caller identity, policy enforcement outcomes, and cost attribution. They'd get better signal, not less. I also showed how the governance dashboard surfaced per-model usage analytics that their team had wanted to build but hadn't prioritized — a win they got for free.

**With the MCP Runtime team**, I flipped the narrative. Instead of presenting governance as friction, I showed the tool catalog experience: developers discover MCP-compatible tools in a searchable registry, see which tools are approved for their project, and connect them with a single click. Governance became the *distribution mechanism* for MCP tools, not a gate in front of them. The approval workflow was opt-in, not blocking — teams that wanted open tool access could have it. I framed it as: *"Every AI Gateway customer now has a reason to use MCP tools, because the governance layer makes them enterprise-safe."*

**With Security & Compliance**, I walked through the virtual key architecture: how keys are scoped to specific models and tools, how they abstract underlying Azure credentials so developers never touch service-level secrets, and how approval workflows create an auditable chain of custody. I showed the threat model I'd drafted and the specific attack surfaces I'd identified — including ones I wasn't sure how to mitigate yet. Coming prepared with *their* framework — and being transparent about the open questions — shortened the review cycle significantly. Security teams respond well to PMs who take security seriously enough to identify their own gaps.

---

## Key Decisions I Drove

Four architectural decisions emerged from these alignment conversations that shaped the product direction.
Each one was a point of genuine disagreement that required me to build consensus, not just pick a side.
These decisions are documented as Architecture Decision Records (ADRs) in our team's decision log.

1. **Integrated dashboard experience, not a standalone APIM product** (Reference: [ADR-001](/docs/adrs/adr-001-integrated-dashboard.md))
   The governance experience lives inside the Azure AI Gateway as a first-class tab, not as a separate APIM portal destination. This was the most contentious decision — APIM leadership initially wanted portal parity — but it was the right call for customer experience. Platform engineers govern AI where they build AI. The customer research was unambiguous: 9 out of 10 platform engineers we interviewed said they wanted governance controls *inside* their development environment, not in a separate portal they'd have to context-switch to. The APIM team came around when they saw the prototype demo with actual customer reactions.

2. **MCP as the tool protocol** (Reference: [ADR-002](/docs/adrs/adr-002-mcp-tool-protocol.md))
   We bet on Model Context Protocol as the standard for tool interoperability rather than building a proprietary tool format. This was a forward-looking bet — MCP was still emerging — but it aligned the MCP Runtime team's adoption goals with our governance goals and avoided creating a fragmented tool ecosystem. The alternative (a custom Azure-specific tool schema) would have been faster to ship but would have locked us into a proprietary standard that customers would eventually need to migrate away from.

3. **Phased rollout: Models → Tools → Agents** (Reference: [ADR-007](/docs/adrs/adr-007-phased-rollout.md))
   Rather than trying to ship the full governance suite at once, I proposed a phased approach. Phase 1 focused on model governance (the highest customer demand, lowest cross-team dependency). Phase 2 added tool governance via MCP. Phase 3 will add multi-agent orchestration governance. This sequencing gave each team a clear on-ramp and meant we could ship value to customers within a single quarter rather than waiting for the entire vision to be built. It also created natural proof points — each phase's success built confidence for the next.

4. **Virtual keys as primary developer auth** (Reference: [ADR-006](/docs/adrs/adr-006-virtual-keys.md))
   Virtual keys became the abstraction layer between developers and underlying Azure credentials. This simplified the developer experience (one key per project, not one key per model per service), enabled fine-grained access control (scope a key to specific models, tools, and usage limits), and gave Security a single enforcement point for credential governance. The Security team was initially skeptical — another abstraction layer means another thing that can break — but the prototype demo showing how virtual keys eliminate the need for developers to handle raw service credentials won them over.

---

## What Didn't Go Smoothly

I want to be honest about the friction, because cross-org alignment is never clean. Presenting a polished success narrative would undermine the whole point of this case study. The value of prototype-first alignment is that it *works* — but "works" doesn't mean "was easy."

**APIM pushed back hard on the gateway-first approach.** Their concern was legitimate: if AI Gateway governance lives exclusively in the AI Gateway dashboard, what happens to APIM customers who don't use it? What about the thousands of existing APIM customers who manage traditional APIs and are now adding AI endpoints? We spent a full week going back and forth before landing on a compromise — the AI Gateway dashboard is the *primary* experience, but core gateway policy configuration remains accessible through the APIM portal. The AI Gateway experience is the recommended path, not the only path. This added design complexity but preserved APIM's product coherence. The key unlock was framing it as "gateway-first, not gateway-only" — a distinction that gave APIM leadership the assurance they needed.

**Gateway UX had real sprint capacity constraints.** They were already committed to shipping Build experience improvements for an upcoming milestone, and their engineering team was stretched across prompt playground improvements, deployment workflows, and evaluation tooling. We couldn't just add Operate tab work to their backlog without giving something back. The resolution was negotiating a shared design resource — I secured a designer from the APIM team to embed with the Gateway UX squad for the Operate tab work. This kept the Gateway UX core team focused on Build while making progress on Operate. It worked, but it required three levels of management buy-in and a commitment that the embedded designer would follow the gateway's design system, not introduce APIM patterns.

**Security review of virtual keys took three weeks longer than planned.** The virtual key architecture introduced a new credential abstraction that Security hadn't reviewed before. Their team was thorough — rightfully so — and the review surfaced two design issues we hadn't anticipated: a key rotation race condition that could leave stale keys active for up to 60 seconds, and a cross-tenant isolation gap in the key metadata store. We fixed both, but the timeline impact forced me to descope one Phase 1 feature (cross-project key sharing) to keep the milestone date. The right call, but a painful one — I had to go back to two design partners who were specifically excited about cross-project keys and explain the delay.

**The MCP spec changed mid-development.** We'd designed the tool registration UX around an earlier version of the MCP specification. When the spec updated with breaking changes to the tool manifest format — specifically, the way tool parameters and return types were declared — we had to redesign the registration flow and update our validation logic. This cost about a week of rework and a tense conversation with the MCP Runtime team about spec stability commitments going forward. We now have a standing bi-weekly sync to catch spec changes earlier, and I pushed for a "spec freeze" window aligned to our sprint cycles.

---

## Timeline

```
Week 1                       Week 2                       Week 3
──────────────────────────────────────────────────────────────────────────
│                            │                            │
│ Day 1-2:                   │ Day 8:                     │ Day 15:
│   1:1s with each team's    │   APIM walkthrough         │   Incorporated final
│   lead PM to understand    │   (focused on runtime      │   feedback from all teams
│   concerns & priorities    │   policy mapping)          │
│                            │                            │ Day 16:
│ Day 3-5:                   │ Day 9:                     │   Leadership demo
│   Built prototype          │   Gateway UX walkthrough   │   (CVP + partner PMs)
│   (Node.js + Express +     │   (focused on Operate      │
│   HTML dashboard)          │   tab architecture)        │ Day 17:
│                            │                            │   Investment decision
│ Day 5:                     │ Day 10:                    │   confirmed
│   Drafted threat model     │   AI Services walkthrough  │
│   for Security review      │   (focused on latency      │ Day 18-19:
│                            │   and diagnostics)         │   Design partner outreach
│                            │                            │   (8 enterprises engaged)
│                            │ Day 11:                    │
│                            │   MCP Runtime walkthrough  │ Day 20:
│                            │   (focused on tool         │   Phase 1 sprint planning
│                            │   catalog & adoption)      │   Cross-team RACI
│                            │                            │   finalized
│                            │ Day 12:                    │
│                            │   Security walkthrough     │ Day 21:
│                            │   (focused on virtual      │   Alignment confirmed:
│                            │   key threat model)        │   all 5 teams committed
│                            │                            │   resources to Phase 1
│                            │ Day 13-14:                 │
│                            │   Iterated prototype       │
│                            │   based on feedback        │
──────────────────────────────────────────────────────────────────────────
         ↓                            ↓                            ↓
    UNDERSTAND                     ALIGN                       COMMIT
  (Listen & Build)           (Demo & Iterate)          (Decide & Resource)
```

---

## Results

- **5 teams aligned in ~3 weeks** — compared to the typical 2–3 month cross-org alignment cycle for initiatives of this scope at Microsoft. The key accelerant was the prototype: it compressed what would normally be weeks of spec review and abstract debate into concrete, iterative conversations.

- **Prototype demo to leadership secured investment commitment.** The working demo — not a deck — is what got the "yes." Leadership could see the experience, not just imagine it. The CVP's feedback was telling: *"This is the first time someone has shown me what AI governance actually looks like for a customer."*

- **Design partner pipeline of 8 enterprise customers** built directly from demo sessions. Three of those customers had previously told us they were evaluating third-party AI governance tools. The prototype gave them a reason to wait for our solution. Two of them committed to co-development partnerships, providing direct feedback on the Phase 1 experience.

- **Phase 1 (Model Governance) shipped on time** with all 5 teams contributing engineering resources. No team was dragged along — each had clear ownership of their component:
  - APIM: Gateway runtime and policy engine
  - Gateway UX: Operate tab UX and navigation
  - AI Services: Model telemetry integration and latency benchmarks
  - MCP Runtime: Tool manifest schema and registry API
  - Security: Virtual key architecture review and credential isolation

- **Created a reusable "prototype-first alignment" playbook** that two other PM teams in Azure have since adopted for their own cross-org initiatives. The playbook documents the three-phase approach (Understand → Align → Commit), the 1:1 walkthrough strategy, and templates for cross-team RACI and shared metrics dashboards.

### Impact by the Numbers

| Metric | Before | After |
|--------|--------|-------|
| Cross-team alignment cycle | 2–3 months (org average) | ~3 weeks |
| Teams contributing resources | 0 (no unified initiative) | 5 |
| Enterprise design partners | 0 | 8 |
| Phase 1 delivery | No shared milestone | On time, all teams contributing |
| Reuse of alignment playbook | N/A | Adopted by 2 other Azure PM teams |

---

## What I'd Do Differently

- **Bring Security in during Week 1, not Week 2.** The three-week review delay was partly my fault. If I'd included Security in the initial prototype walkthroughs — even before the threat model was complete — we could have started the review cycle earlier and likely avoided the Phase 1 descope. Security teams move at their own pace for good reasons, and giving them more lead time is always the right call.

- **Formalize the cross-team RACI earlier.** For the first two weeks, ownership boundaries were informal — "APIM owns the runtime, Gateway UX owns the UX" was understood but not documented. This caused one design conflict in Week 3 around who owned the policy configuration UI: should it live in the Operate tab (Gateway UX's domain) or link to the APIM portal (APIM's domain)? A lightweight RACI doc in Week 1 would have prevented that specific conflict and saved two days of back-and-forth.

- **Build a shared metrics dashboard from day one.** Each team tracked adoption signals in their own telemetry systems. It took until Week 4 (post-alignment) to build a unified dashboard showing end-to-end funnel metrics — from model deployment to gateway policy attachment to virtual key creation. If that dashboard had existed during the alignment conversations, it would have given every team a shared definition of success and a common language for tracking progress.

---

## Lessons for Cross-Org PM Work

- **A working prototype is worth a hundred strategy decks.** Prototypes force concrete conversations. They eliminate the ambiguity that lets people project fears onto abstract proposals. When you show someone a demo, the question shifts from "should we do this?" to "what would you change?" — and that's a fundamentally easier conversation to have. The investment to build a prototype is measured in days; the time saved in alignment is measured in months.

- **Align teams one at a time before aligning them together.** Group presentations invite posturing. Individual walkthroughs invite honesty. I learned each team's real concerns in 1:1 settings, addressed them in the prototype, and only brought everyone together once each team had already said some version of "yes" individually. By the time we had the all-hands alignment meeting, it was a ratification ceremony, not a debate.

- **Sequence your rollout to minimize cross-team dependencies.** The phased approach (Models → Tools → Agents) wasn't just a delivery strategy — it was an alignment strategy. Phase 1 required deep collaboration with only two teams (APIM + Gateway UX). By the time Phase 2 required all five teams, we'd already built the working relationship and trust from shipping Phase 1 together. Trust is earned in small increments, not granted in big proposals.

- **Be honest about what's hard, including with leadership.** I didn't hide the APIM pushback or the Security delay from leadership. Surfacing friction early builds credibility and gives leaders the chance to help unblock — which they did, twice. PMs who only present smooth narratives lose trust when reality inevitably diverges. Your job is to solve problems, not to pretend they don't exist.

- **Shared incentives matter more than shared OKRs.** We never created a single cross-team OKR for AI Gateway. Instead, I made sure each team's *existing* OKRs were advanced by the initiative. APIM got a new enterprise workload. Gateway UX got lifecycle completeness. AI Services got regulated-industry adoption. MCP Runtime got a distribution channel. Security got a governed-by-default reference architecture. When the initiative advances everyone's goals, you don't need to manufacture alignment — you just need to make it visible.

---

*This case study reflects work done across Azure API Management, Azure AI Gateway, Azure AI Services, and related Microsoft teams. All team-level details are described at the organizational level; individual contributors are not named.*
