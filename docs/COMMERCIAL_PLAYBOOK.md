# Logic Estancia · Commercial playbook

This document turns the 12-month product roadmap into an operating system. It does not claim that interviews, proposals, prices or signed projects already exist.

## North star and gates

- North star: signed paid implementation projects.
- Month 3 pricing gate: 15 qualified interviews and 5 real proposals.
- Month 6 target: 3 cumulative signed projects.
- Month 9 pacing target: 5 cumulative signed projects.
- Month 12 target: 8 cumulative signed projects.
- Response SLA: every qualified request has a next action within one business day.
- Public pricing remains “scope after assessment” until the pricing gate is met.

## Weekly cadence · 20 hours

Months 1–3:

- 10 hours product, QA and conversion.
- 6 hours interviews, prospecting and follow-up.
- 3 hours high-intent content.
- 1 hour metrics and administration.

From month 4:

- 8 hours product and conversion.
- 8 hours sales and follow-up.
- 3 hours content.
- 1 hour metrics.

Weekly minimum:

- Review every deal without a next action.
- Contact 10 hand-picked accounts with a segment-specific message.
- Run one or two discovery calls or demos.
- Protect one uninterrupted implementation block.
- Record objections and loss reasons in HubSpot.

## Interview script

1. How does an enquiry arrive today?
2. Who checks availability and proposes an alternative?
3. Where are booking, guest, rate and payment context kept?
4. What usually threatens an arrival?
5. Which work is repeated across properties or departments?
6. Which provider or integration cannot be replaced?
7. What would need to be true to change the current process?
8. What implementation window is realistic?
9. Which investment range could be approved?
10. Present one package and test the reaction without discounting immediately.

Record exact language, current stack, critical workflow, required integrations, timeline, range, objection and next step. Do not record guest data.

## HubSpot setup

Create a private app with contact read/write and deal read/write scopes, then configure `HUBSPOT_ACCESS_TOKEN` as a Wrangler secret. Keep pipeline and first stage configurable through `HUBSPOT_PIPELINE` and `HUBSPOT_DEAL_STAGE`.

Pipeline stages:

1. New
2. Contacted
3. Assessment completed
4. Meeting
5. Proposal
6. Negotiation
7. Won
8. Lost

Create these contact properties to receive structured assessment data. The Worker falls back to standard contact properties plus a complete deal description when they are absent.

- `logic_estancia_accommodation_type`
- `logic_estancia_business_mode`
- `logic_estancia_property_count`
- `logic_estancia_unit_count`
- `logic_estancia_recommended_plan`
- `logic_estancia_timeline`
- `logic_estancia_investment_range`
- `logic_estancia_requested_capabilities`
- `logic_estancia_source_path`
- `logic_estancia_marketing_consent`

Before production, send one identified test lead and verify contact deduplication, deal association, internal email and visitor summary. Never paste the token into a tracked file.

## GA4/GTM contract

Only configure the allowlisted events emitted by the site:

- `solution_view`, `plan_select`
- `assessment_start`, `assessment_step`, `assessment_complete`, `assessment_submit`
- `demo_open`, `demo_mode_select`, `demo_step_complete`, `demo_flow_complete`, `demo_cta`
- `lead_submit`, `meeting_click`, `cta_click`

Allowed parameters are locale, segment, plan, demo, flow, step index and source section. Names, emails, phone numbers, dates, amounts, messages and demo state must never be sent.

## Content system

Publish two Spanish high-intent pages per month. Score candidate pages on commercial intent, segment fit, demonstrable proof and ability to answer a real objection. Translate only pages that generate qualified assessment starts or meetings.

Initial clusters:

- Booking management for tourist apartments and rural portfolios.
- Website and direct booking for independent hotels.
- Website enquiry versus live booking engine.
- PMS, booking manager and channel manager boundaries.
- Hotel cleaning and arrival coordination.
- Supervised AI for guest communication.

Competitor comparisons must be checked against current official sources immediately before publication. Do not reuse unverified feature or price claims.

## Monthly review

Review the funnel in this order:

1. Assessment starts.
2. Assessment completion.
3. Optional contact submission.
4. Meetings.
5. Proposals.
6. Won and lost projects.

Change one main conversion hypothesis at a time. Keep the three canonical demos and five deep flows unless sales evidence justifies more scope.
