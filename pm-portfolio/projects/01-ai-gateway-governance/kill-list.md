# Feature Kill List — AI Gateway Governance

**Author:** Anish Tallapureddy · PM, Azure API Management / AI Gateway · Microsoft
**Last Updated:** June 2025
**Project:** AI Gateway Governance (Project 01)

---

> Great PMs are defined as much by what they **kill** as what they ship. Every feature
> has a cost — not just the engineering investment, but the opportunity cost of what you
> *didn't* build instead. This document captures the features I seriously evaluated and
> deliberately killed, along with the reasoning and outcomes. These kills are not
> failures; they are the discipline that kept the AI Gateway Governance project on track.

---

## Summary

| # | Feature | Proposed By | Time Evaluated | Why Killed (One-Liner) | Outcome |
|---|---------|-------------|----------------|------------------------|---------|
| 1 | Custom Policy XML Editor in V1 | APIM Power Users (customer advisory board) | 2 weeks | Wrong abstraction for target users; 88% never use raw XML | Zero escalations; 3 users leveraged APIM portal escape hatch |
| 2 | Real-Time Model Evaluation in Gateway | AI Services team (partner team) | 3 weeks | Adds 200-800ms latency; evals are async by nature | "Observe, don't judge" principle adopted; telemetry integration shipped |
| 3 | Multi-Cloud Agent Sync in Phase 1 | PM (myself) | 4 weeks | Third-party APIs unstable; only 8% of partners needed it | No design partner churn; manual registration handled edge cases |
| 4 | Usage-Based Pricing Per Policy Type | Business/monetization team | 2 weeks | Creates "meter anxiety" — admins disable policies to save money | Tier-based model shipped; enterprise customers praised bundling |
| 5 | GraphQL API Surface for Gateway Management | Developer Experience team | 1 week | Azure management is REST + ARM; 0 of 12 partners wanted it | REST + Terraform + CLI shipped; zero GraphQL requests in 6 months |

---

## Killed Features — Full Analysis

---

### 1. Killed: Custom Policy XML Editor in V1

**Proposed by:** APIM Power Users (customer advisory board)
**Evaluation period:** 2 weeks
**Status:** Killed — Pre-built templates shipped as compromise

**What it was:**
A full XML policy editor — equivalent to APIM's existing policy editor — embedded directly
in the AI Gateway dashboard. This would allow admins to write, test, and deploy custom gateway
policies in raw XML, mirroring the workflow that veteran APIM customers are accustomed to.

**Why it was proposed:**
APIM power users on our customer advisory board expected the same policy editing experience
they have in the standalone APIM portal. Several had built internal tooling around raw XML
policy files and wanted to reuse that investment in the AI Gateway context.

**Why I killed it:**

- **Wrong audience abstraction.** Our target users are AI platform engineers, not APIM
  specialists. Custom XML is intimidating and error-prone for this audience. User research
  showed that 70% of AI Gateway early-access users had never opened the APIM policy editor.
- **Telemetry doesn't justify it.** APIM telemetry shows only **12% of customers** ever
  edit raw policy XML. The remaining 88% use the visual policy builder or pre-built
  templates. Building for the 12% at the cost of the 88% is bad prioritization.
- **Massive capacity hit.** A full XML editor with syntax highlighting, validation,
  IntelliSense, and error handling would consume **~4 engineering sprints** — roughly
  **25% of Phase 1 capacity** — for a feature most AI Gateway users would never touch.
- **Compromise shipped instead:** Pre-built policy templates in V1 covering the top 6
  governance scenarios (rate limiting, content safety, token quotas, semantic caching,
  load balancing, logging). Added an "Advanced Settings" escape hatch that deep-links
  to the full APIM portal for power users who genuinely need raw XML.

**Outcome:**
Zero customer escalations about a missing XML editor during Phase 1. Three power-user
customers used the APIM portal escape hatch — validating that the escape hatch was the
right trade-off. Post-launch survey showed 94% satisfaction with the template-based
approach.

---

### 2. Killed: Real-Time Model Evaluation (Evals) in Gateway

**Proposed by:** AI Services team (partner team)
**Evaluation period:** 3 weeks
**Status:** Killed — Telemetry integration shipped as alternative

**What it was:**
Run quality evaluation checks — accuracy scoring, groundedness detection, coherence
measurement — on every model response at the gateway layer, *before* returning the
response to the client. Requests that failed quality thresholds would be blocked, retried
with a different model, or flagged inline.

**Why it was proposed:**
The AI Services team wanted to position the gateway as a **quality enforcement layer**,
not just a traffic and policy management layer. Their vision was: "Every response that
passes through the gateway is guaranteed to meet a quality bar."

**Why I killed it:**

- **Latency is a dealbreaker.** Real-time evals add **200-800ms latency** per request.
  Our production P99 target for gateway overhead is **<50ms**. A 10x-16x increase in
  overhead is unacceptable for production workloads, especially streaming scenarios.
- **Evals are async by nature.** Quality evaluation is inherently judgmental — "What
  counts as good enough?" varies by use case, prompt, and context. Forcing async,
  subjective judgments into the synchronous request path creates **false confidence**
  ("the gateway approved it, so it must be good") and false negatives.
- **Duplicates existing investment.** The platform already has a dedicated **Evaluation
  service** with sophisticated scoring models, A/B comparison, and human-in-the-loop
  workflows. Duplicating eval logic in the gateway fragments the evaluation story and
  creates two competing sources of truth.
- **Compromise shipped instead:** The gateway emits **structured telemetry** — prompt
  text, response text, model metadata, latency, token counts — that feeds directly INTO
  the existing Evaluation service. The gateway **observes**; the Evaluation service
  **judges**.

**Outcome:**
The AI Services team endorsed the **"observe, don't judge"** principle after reviewing
the latency data. The telemetry integration shipped in Phase 1 and became the **primary
data source** for async evaluations, replacing a manual logging approach that was
losing ~15% of evaluation data. Net win for both teams.

---

### 3. Killed: Multi-Cloud Agent Sync in Phase 1

**Proposed by:** PM (myself) — originally part of Phase 1 scope
**Evaluation period:** 4 weeks
**Status:** Killed — Deferred to Phase 3; manual registration shipped as stopgap

**What it was:**
Automatically sync agent registrations from **Google Vertex AI**, **AWS Bedrock**, and
other cloud AI platforms into the AI Gateway agent catalog. This would enable cross-cloud
governance — a single pane of glass for managing agents regardless of where they run.

**Why it was proposed:**
I proposed this myself. The multi-cloud angle was compelling for the enterprise narrative:
"Azure AI Gateway governs ALL your AI agents, not just Azure ones." It was originally
scoped into Phase 1 as a differentiator.

**Why I killed it (my own feature):**

- **Third-party API instability.** Cross-cloud sync depends on Vertex Agent API and
  Bedrock Agent API — both were in preview during our evaluation. The Vertex API changed
  **3 times** during our 4-week evaluation. Building on shifting sand is engineering debt
  waiting to happen.
- **Reconciliation complexity.** Reliable sync requires a full reconciliation engine to
  handle conflicts, schema mismatches, stale references, and eventual consistency. Our
  estimate: **~6 engineering sprints** just for the sync engine, before any UI work.
- **Low demand signal.** Only **8% of design partner customers** had cross-cloud agent
  deployments. **92% were Azure-only or Azure-primary.** Building a 6-sprint feature for
  8% of customers in Phase 1 is poor resource allocation.
- **Opportunity cost was too high.** Shipping cross-cloud sync would have delayed the
  **Tool Catalog** (Project 03) by one full quarter. The Tool Catalog was requested by
  **4x more customers** than cross-cloud sync. The math was clear.
- **Stopgap shipped instead:** Built a "manual registration" path allowing admins to
  register external agents via API or portal form. Takes ~2 minutes per agent.

**Outcome:**
No design partner churn from the deferral. The manual registration path handled the
8% cross-cloud use case adequately — most had fewer than 10 external agents to register.
Phase 3 planning can now leverage **stabilized** third-party APIs (Vertex Agent API went
GA in Q1 2025, Bedrock Agent API stabilized in Q4 2024).

---

### 4. Killed: Usage-Based Pricing Per Policy Type

**Proposed by:** Business/monetization team
**Evaluation period:** 2 weeks
**Status:** Killed — Tier-based pricing shipped instead (see Project 05)

**What it was:**
Instead of flat tier pricing, charge granularly per policy type: **$X/month for rate
limiting**, **$Y/month for content safety**, **$Z/month for semantic caching** — so
customers only pay for the specific governance policies they enable.

**Why it was proposed:**
The monetization team argued that per-policy pricing is more "transparent" and "fair" —
customers shouldn't pay for capabilities they don't use. They also believed it would
lower the entry barrier since customers could start with one cheap policy.

**Why I killed it:**

- **"Meter anxiety" kills adoption.** Per-policy pricing creates a perverse incentive:
  admins **disable governance policies to save money**. This is the exact opposite of
  what the product should incentivize. We *want* customers to turn on more policies, not
  fewer. Pricing should encourage comprehensive governance, not punish it.
- **No competitive precedent.** Competitive analysis across **8 gateway competitors**
  (Kong, Apigee, AWS API Gateway, Cloudflare, etc.) showed **zero** using per-policy
  pricing. All use tier-based or consumption-based models. Per-policy pricing would
  confuse buyers who expect industry-standard pricing structures.
- **Revenue impact is negative.** Finance modeling showed per-policy pricing generates
  **15% less revenue** in the base case because customers cherry-pick the 2-3 cheapest
  policies instead of adopting the full governance stack.
- **Unbundling undermines the value prop.** The value of the AI Gateway is the
  **bundle** — governance + observability + security as one integrated layer. Unbundling
  policies into individual line items commoditizes each policy and invites per-policy
  competitive comparisons instead of platform-level comparisons.

**Outcome:**
Shipped the **tier-based model** (Free → Standard → Pro) documented in Project 05:
Gateway Pricing Tiers. Enterprise customers explicitly praised the "everything included"
Pro tier in post-launch feedback. **Net Promoter Score for pricing: 42** — above the
Azure services average of 35.

---

### 5. Killed: GraphQL API Surface for Gateway Management

**Proposed by:** Developer Experience team
**Evaluation period:** 1 week (fastest kill)
**Status:** Killed — REST + Terraform + CLI shipped instead

**What it was:**
Expose the gateway management API as a **GraphQL endpoint** in addition to the REST API.
The pitch: developers could write rich, nested queries to fetch gateway configuration,
analytics, and agent metadata in a single request instead of multiple REST calls.

**Why it was proposed:**
The Developer Experience team was enthusiastic about GraphQL's developer ergonomics.
They argued it would reduce the number of API calls needed to build dashboards and
management UIs, and would appeal to the "modern developer" audience.

**Why I killed it (fastest kill):**

- **Maintenance orphan risk.** APIM's management plane is **entirely REST-based**.
  Building a GraphQL translation layer means maintaining a REST-to-GraphQL adapter
  indefinitely, with every REST API change requiring a corresponding GraphQL schema
  update. This is a maintenance tax that compounds over time.
- **Azure platform misalignment.** Azure management APIs are standardized on
  **REST + ARM (Azure Resource Manager)**. A GraphQL management endpoint would make the
  AI Gateway the **only Azure service** using GraphQL for resource management — a
  maintenance orphan with no platform support, no shared tooling, and no precedent.
- **Wrong audience.** The audience for gateway *management* APIs is **platform admins**
  — people who use Terraform, Azure CLI, and the Azure portal. This is a fundamentally
  different audience from app developers who love GraphQL. Admins want stability and
  infrastructure-as-code support, not query flexibility.
- **Direct customer signal was definitive.** I asked **12 design partners** directly:
  "Would you use GraphQL for gateway management?" **Zero said yes.** Three said
  explicitly: *"Please don't — just give me good Terraform support."*

**Outcome:**
Shipped **REST API + Terraform provider + Azure CLI extension**. In 6 months
post-launch, **zero customers** have requested GraphQL for gateway management. The
Terraform provider, by contrast, was adopted by **60% of enterprise customers** within
the first quarter.

---

## Principles Behind the Kills

These five kills weren't ad hoc — they follow a consistent decision framework that I
apply when evaluating whether to build, defer, or kill a feature:

1. **Solve for the 80%, escape-hatch for the 20%.** If a feature serves less than 20%
   of target users, it doesn't belong in the core product for V1. Instead, build an
   escape hatch (deep link, manual workaround, API fallback) that unblocks the minority
   without burdening the majority. Applied to: XML Editor (#1), Multi-Cloud Sync (#3).

2. **If it adds latency to the hot path, it's guilty until proven innocent.** Gateway
   overhead is a zero-sum game. Every millisecond added to the request path must justify
   itself against the production SLA. Features that add >10ms must have overwhelming
   demand. Features that add >100ms are almost always killed. Applied to: Real-Time
   Evals (#2).

3. **Pricing should incentivize good behavior, not penalize it.** The pricing model
   must encourage customers to adopt *more* of the product, not less. If a pricing
   structure creates a financial incentive to disable features, the pricing is broken
   regardless of how "fair" or "transparent" it appears. Applied to: Per-Policy
   Pricing (#4).

4. **When customer signal is unanimous, act fast.** If I can get a clear, unambiguous
   signal from design partners in under a week, I don't need a multi-sprint evaluation.
   Kill it quickly and reallocate capacity to something customers actually want. Slow
   kills are expensive — fast kills are free. Applied to: GraphQL Surface (#5).

---

*This document is part of my PM portfolio. For the features I shipped (and why), see the
companion [shipping-spec.md](./shipping-spec.md) and [design-decisions.md](./design-decisions.md).*
