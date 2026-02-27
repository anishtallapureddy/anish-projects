# ADR-[NNN]: [Decision Title]

> *Copy this template for each significant design or product decision. Number sequentially (ADR-001, ADR-002, etc.).*

---

**Date:** *YYYY-MM-DD*
**Status:** *Proposed | Accepted | Deprecated | Superseded by [ADR-NNN]*
**Deciders:** *List the people involved in making this decision*

---

## Context

*Describe the situation and forces at play. What is happening that requires a decision? Include relevant technical, business, or user context. Be specific enough that someone reading this in 6 months will understand the circumstances.*

## Decision

*State the decision clearly and concisely. What are we going to do?*

> *e.g., We will use Azure API Management as the gateway layer for all AI model traffic, with policy-based rate limiting and semantic caching.*

## Rationale

*Explain why this decision was made. What evidence, principles, or constraints led to this choice? Reference data, user research, or prior discussions where applicable.*

- *e.g., APIM provides built-in token-level rate limiting, which eliminates the need to build custom middleware*
- *e.g., Aligns with the platform team's existing investment in Azure infrastructure*
- *...*

## Alternatives Considered

| Alternative | Pros | Cons | Why Not Chosen |
|---|---|---|---|
| *e.g., Build custom gateway* | *Full control, no vendor lock-in* | *6+ months to build, ongoing maintenance* | *Timeline and team capacity constraints* |
| *e.g., Use third-party gateway (Kong)* | *Mature ecosystem, plugins* | *No native Azure integration, added cost* | *Integration complexity with existing stack* |
| *e.g., No gateway (direct access)* | *Simplest initial path* | *No rate limiting, no observability* | *Unacceptable risk for production traffic* |

## Consequences

*What are the implications of this decision — both positive and negative?*

### Positive

- *e.g., Faster time to market — estimated 8 weeks vs. 24 weeks for custom build*
- *e.g., Centralized observability across all model endpoints*

### Negative

- *e.g., Vendor dependency on Azure APIM pricing and feature roadmap*
- *e.g., Team needs to ramp up on APIM policy authoring*

### Risks

- *e.g., If APIM does not support a future requirement, migration cost will be significant*

## Related Decisions

- *[ADR-NNN: Related decision title](link)*
- *[ADR-NNN: Another related decision](link)*
