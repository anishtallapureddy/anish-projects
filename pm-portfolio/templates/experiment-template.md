# Experiment: [Experiment Name]

> *Copy this template for each A/B test or experiment. Fill in the top section before launch and the bottom section after results are in.*

---

**Date:** *YYYY-MM-DD*
**Author:** *Your name*
**Status:** *Planning / Running / Analyzing / Complete*

---

## Hypothesis

*State your hypothesis in the format: "If we [change], then [metric] will [improve/decrease] because [rationale]."*

> *e.g., If we simplify the onboarding wizard from 5 steps to 3 steps, then activation rate will increase by 10% because users are dropping off at step 4.*

## Metric to Move

| Metric | Type | Current Baseline | Target Lift |
|---|---|---|---|
| *e.g., Activation rate* | *Primary* | *32%* | *+10% (→ 35.2%)* |
| *e.g., Time to first action* | *Secondary* | *8 min* | *-25% (→ 6 min)* |
| *e.g., Support ticket volume* | *Guardrail* | *50/week* | *No increase* |

## Control vs. Treatment

| | Control (A) | Treatment (B) |
|---|---|---|
| **Description** | *Current 5-step onboarding wizard* | *Simplified 3-step onboarding wizard* |
| **Key Difference** | *Steps 3 and 4 present on separate screens* | *Steps 3 and 4 combined into a single screen* |
| **Targeting** | *50% of new users* | *50% of new users* |

## Sample Size & Duration

| Parameter | Value |
|---|---|
| **Minimum sample size per variant** | *e.g., 2,500 users* |
| **Statistical significance threshold** | *e.g., 95% (p < 0.05)* |
| **Minimum detectable effect (MDE)** | *e.g., 3% absolute lift* |
| **Estimated duration** | *e.g., 14 days* |
| **Traffic allocation** | *e.g., 50/50* |

## Success Criteria

*Define what constitutes a clear win, a clear loss, and an inconclusive result.*

- **Ship Treatment if:** *Primary metric improves ≥ MDE with p < 0.05 AND no guardrail regression*
- **Revert to Control if:** *Primary metric decreases OR guardrail metric regresses significantly*
- **Inconclusive if:** *Results do not reach significance within the planned duration*

---

## Results

> *Fill in this section after the experiment completes.*

**Run dates:** *YYYY-MM-DD to YYYY-MM-DD*
**Actual sample size:** *A: ___  B: ___*

| Metric | Control | Treatment | Δ (Absolute) | Δ (Relative) | p-value | Significant? |
|---|---|---|---|---|---|---|
| *Primary* | | | | | | *Yes / No* |
| *Secondary* | | | | | | |
| *Guardrail* | | | | | | |

## Learnings

*What did you learn from this experiment, regardless of whether it "won"?*

- *e.g., Users who saw the simplified flow had 20% fewer support tickets*
- *e.g., Mobile users responded more strongly than desktop users*
- *...*

## Next Steps

*Based on the results, what happens next?*

- [ ] *e.g., Ship treatment to 100% of users*
- [ ] *e.g., Run follow-up experiment on step 2 copy*
- [ ] *e.g., Update PRD with revised flow*
- [ ] *e.g., Share results in stakeholder review*
