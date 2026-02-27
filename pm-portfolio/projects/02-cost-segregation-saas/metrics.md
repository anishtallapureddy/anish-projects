# Success Metrics & Analytics Event Schema

## Key Performance Indicators (KPIs)

### Acquisition
- **Website visits** (monthly unique visitors)
- **Sign-up conversion rate** (visitors → registered users)
- **Source attribution** (organic, paid, referral, direct)
- **Cost per acquisition (CPA)** (total marketing spend / new users)

### Activation
- **Time to first report (T2FR)** — elapsed time from sign-up to first completed analysis
- **Property input completion rate** — funnel: step 1 → step 2 → step 3 → submit
- **Free analysis → paid report conversion rate**

### Engagement
- **Reports generated per user per month**
- **Dashboard return rate** (7-day and 30-day retention)
- **Average properties per account**
- **Feature usage rates** (renovations added, features toggled)

### Revenue
- **Monthly Recurring Revenue (MRR)**
- **Average Revenue Per User (ARPU)**
- **Report purchases** (one-time)
- **Subscription upgrades/downgrades**
- **Churn rate** (monthly)

### Satisfaction
- **NPS score** (quarterly survey)
- **Support ticket volume**
- **Report accuracy feedback** (thumbs up/down on report page)
- **Time spent on report page**

---

## OKRs (Q1 2026 Launch)

### O1: Validate Product-Market Fit
| Key Result | Target | Measurement |
|---|---|---|
| KR1 | 500 free analyses generated | Analytics event count |
| KR2 | 50 paid reports purchased | Stripe transaction count |
| KR3 | 10% free-to-paid conversion rate | Paid users / free users |
| KR4 | Average T2FR < 3 minutes | Median time between `signup` and `report_generation_completed` |

### O2: Build Trust & Credibility
| Key Result | Target | Measurement |
|---|---|---|
| KR1 | NPS > 40 | Quarterly survey |
| KR2 | 5 CPA beta testers onboarded | CPA plan sign-ups |
| KR3 | 0 IRS compliance complaints | Support ticket triage |
| KR4 | < 5% support tickets about report accuracy | Ticket categorization |

### O3: Establish Revenue Foundation
| Key Result | Target | Measurement |
|---|---|---|
| KR1 | $2,500 MRR by end of Q1 | Stripe MRR dashboard |
| KR2 | 3 Pro plan subscribers | Active subscription count |
| KR3 | < $50 CAC for paid users | Marketing spend / paid conversions |

---

## Analytics Event Schema

All events follow this structure:

```json
{
  "event": "event_name",
  "timestamp": "ISO 8601",
  "user_id": "string | null",
  "session_id": "string",
  "properties": { }
}
```

### Page Events

| Event Name | Trigger | Properties | Category |
|---|---|---|---|
| `page_view` | Any page load | `page: string` — page path or name | Page |
| | | `referrer: string \| null` — referring URL | |
| `landing_cta_click` | User clicks a CTA on landing page | `cta_type: string` — e.g. "get_started", "learn_more", "pricing" | Page |
| | | `position: string` — e.g. "hero", "mid_page", "footer" | |

### Property Input Events

| Event Name | Trigger | Properties | Category |
|---|---|---|---|
| `property_form_started` | User begins the property input wizard | _(none)_ | Property Input |
| `property_step_completed` | User completes a step in the wizard | `step_number: integer` — 1, 2, or 3 | Property Input |
| | | `time_on_step: integer` — seconds spent on the step | |
| `property_feature_toggled` | User toggles a building feature | `feature_name: string` — e.g. "elevator", "sprinkler_system" | Property Input |
| | | `enabled: boolean` — toggled on or off | |
| `renovation_added` | User adds a renovation entry | `category: string` — e.g. "roof", "hvac", "interior_finish" | Property Input |
| | | `cost: number` — renovation cost in USD | |
| `property_form_submitted` | User submits the property form | `building_type: string` — e.g. "office", "retail", "multifamily" | Property Input |
| | | `has_renovations: boolean` — whether renovations were included | |
| | | `feature_count: integer` — number of features selected | |
| `property_form_abandoned` | User leaves the form without submitting | `step_number: integer` — last step reached | Property Input |
| | | `time_spent: integer` — total seconds in the form | |

### Report Events

| Event Name | Trigger | Properties | Category |
|---|---|---|---|
| `report_generation_started` | Report generation begins | `property_id: string` | Report |
| `report_generation_completed` | Report generation finishes | `property_id: string` | Report |
| | | `accelerated_percent: number` — % of basis reclassified to shorter-life | |
| | | `total_savings: number` — estimated first-year tax savings in USD | |
| | | `generation_time_ms: integer` — engine processing time | |
| `report_viewed` | User opens a completed report | `report_id: string` | Report |
| | | `time_on_page: integer` — seconds spent viewing | |
| `report_downloaded_pdf` | User downloads the PDF version | `report_id: string` | Report |
| `depreciation_schedule_expanded` | User expands the depreciation schedule section | `report_id: string` | Report |

### Dashboard Events

| Event Name | Trigger | Properties | Category |
|---|---|---|---|
| `dashboard_viewed` | User loads the dashboard | `property_count: integer` — number of properties in account | Dashboard |
| | | `report_count: integer` — number of completed reports | |
| `property_card_clicked` | User clicks a property card | `property_id: string` | Dashboard |
| `new_property_started_from_dashboard` | User clicks "Add Property" on dashboard | _(none)_ | Dashboard |

### Conversion Events

| Event Name | Trigger | Properties | Category |
|---|---|---|---|
| `pricing_viewed` | User views the pricing page | `source_page: string` — page they navigated from | Conversion |
| `plan_selected` | User selects a plan | `plan_type: string` — "single_report", "pro", "cpa" | Conversion |
| | | `price: number` — listed price in USD | |
| `payment_started` | User initiates Stripe checkout | `plan_type: string` | Conversion |
| `payment_completed` | Stripe confirms payment | `plan_type: string` | Conversion |
| | | `amount: number` — charged amount in USD | |
| `payment_failed` | Payment attempt fails | `plan_type: string` | Conversion |
| | | `error_type: string` — e.g. "card_declined", "insufficient_funds", "expired_card" | |

### Engagement Events

| Event Name | Trigger | Properties | Category |
|---|---|---|---|
| `session_started` | User begins a new session | `is_returning: boolean` — has previous sessions | Engagement |
| | | `user_plan: string \| null` — "free", "pro", "cpa", or null if anonymous | |
| `session_ended` | Session ends (inactivity timeout or explicit logout) | `duration_seconds: integer` — total session length | Engagement |
| | | `pages_viewed: integer` — distinct pages visited | |

---

## Measurement Plan

| KPI | Data Source | Measurement Method | Reporting Frequency | Owner |
|---|---|---|---|---|
| Website visits | Analytics (PostHog / Plausible) | `page_view` event count, deduplicated by `session_id` | Weekly | Marketing |
| Sign-up conversion rate | Auth provider + Analytics | Registered users / unique visitors | Weekly | Marketing |
| Source attribution | Analytics UTM params | `page_view.referrer` + UTM tag parsing | Weekly | Marketing |
| Cost per acquisition | Ad platforms + Analytics | Total ad spend / new sign-ups | Monthly | Marketing |
| Time to first report (T2FR) | Analytics | Median time between `session_started` (first) and `report_generation_completed` (first) | Weekly | Product |
| Property input completion rate | Analytics | Funnel: `property_form_started` → `property_step_completed(3)` → `property_form_submitted` | Weekly | Product |
| Free → paid conversion rate | Analytics + Stripe | `payment_completed` users / free-tier users | Monthly | Product |
| Reports per user per month | Database + Analytics | `report_generation_completed` count grouped by `user_id` per month | Monthly | Product |
| Dashboard return rate | Analytics | Users with `dashboard_viewed` in 7-day / 30-day windows | Weekly | Product |
| Average properties per account | Database | `COUNT(properties) / COUNT(users)` | Monthly | Engineering |
| Feature usage rates | Analytics | `property_feature_toggled` and `renovation_added` event counts | Monthly | Product |
| MRR | Stripe | Stripe MRR metric from Billing dashboard | Weekly | Finance |
| ARPU | Stripe + Database | MRR / active paying users | Monthly | Finance |
| Report purchases | Stripe | `payment_completed` where `plan_type = "single_report"` | Weekly | Finance |
| Subscription upgrades/downgrades | Stripe webhooks | `customer.subscription.updated` events | Monthly | Finance |
| Churn rate | Stripe | Canceled subscriptions / total subscriptions at start of month | Monthly | Finance |
| NPS score | Survey tool (Typeform / in-app) | Quarterly NPS survey distribution | Quarterly | Product |
| Support ticket volume | Help desk (Linear / Intercom) | Ticket count by category | Weekly | Support |
| Report accuracy feedback | In-app feedback widget | Thumbs up/down ratio on report page | Weekly | Product |
| Time spent on report page | Analytics | `report_viewed.time_on_page` median and p90 | Weekly | Product |
