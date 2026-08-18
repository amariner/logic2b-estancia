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
- Record objections and loss reasons in the internal discovery notes, without guest data.

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

## CRM boundary

HubSpot is not part of the current product or production scope. The Worker has no HubSpot binding, token contract or executable CRM branch: a stale or accidental environment value cannot create contacts or deals. Reintroducing any CRM requires a future explicit product decision, a new privacy and retention review, an idempotent delivery design and dedicated tests before configuration.

## Lead environment configuration

Configure these values in the Cloudflare Worker environment, never in tracked source:

- `LEADS_RESEND_API_KEY`: Resend credential.
- `LEADS_FROM_EMAIL`: verified sender address shown under the Logic Estancia name.
- `LEADS_INTERNAL_RECIPIENT`: internal mailbox that receives the complete request.
- `LEADS_REPLY_TO`: monitored address used when the visitor replies to their summary.
- `LEADS_MEETING_URL`: public HTTPS scheduling URL, without embedded credentials.

In production, `LEADS_INTERNAL_RECIPIENT` is `marinerandreu+logic@gmail.com`. Email delivery is only eligible when the API key and all three addresses pass validation; otherwise the endpoint fails closed. A missing or invalid meeting URL is never rendered as a link.

Use `apps/worker/.dev.vars.example` only as a local shape reference. Definitive addresses and the scheduling URL require human validation before deployment.

## Lead delivery resilience and recovery

Cloudflare Durable Objects keep the five-submissions-per-minute IP limit outside individual Worker isolates. They also retain a submission reference for one fixed 24-hour window from the first delivery attempt in the EU jurisdiction; a completed response is cached only for the remainder of that same window. Failed attempts schedule the same expiry, equivalent retries do not extend it, and Resend receives `estancia-lead/{ref}/internal` and `estancia-lead/{ref}/visitor` idempotency keys.

Use the structured Worker log event and its `ref` when a provider is degraded:

1. For `lead_delivery_degraded`, the internal request is already delivered but the visitor summary failed. Use the reference to verify the internal message before deciding whether to acknowledge it manually.
2. In Resend, inspect both idempotency keys for that reference before resending a message.
3. For `lead_delivery_failed`, retry the unchanged payload within 24 hours; changing any lead field intentionally creates a different submission identity.
4. If `lead_coordination_failed` appears, restore the Durable Object binding before retrying. The endpoint fails closed instead of bypassing rate limiting or idempotency.
5. For `lead_email_configuration_invalid`, repair every named field before relying on Resend. For `lead_meeting_configuration_invalid`, verify the public HTTPS agenda value; no unsafe value is returned to the browser.

An internal Resend message is the mandatory delivery. A visitor summary without the internal message is a failed submission, returns `502` and remains retryable with the same durable reference during its original 24-hour window; an internal message without the visitor summary returns `202 delivered_degraded`. Each Resend request is aborted after 10 seconds so a stalled provider cannot hold the form indefinitely. A timeout follows the same failed/degraded contract, and retrying the unchanged payload within that window remains safe because both messages keep their stable idempotency keys. After expiry, a retry intentionally starts a new reference and must be treated as a new delivery attempt. Do not create CRM records while HubSpot remains outside the production scope.

### Demo form boundary

Only the commercial form on the Logic Estancia landing may call `/api/leads` and become eligible for Resend. Nivora, Terrava, Aurem and their workspaces are local fixtures: their controls may validate fields, open a simulated checkout or persist fictitious state in the browser, but they must never send email, create a lead, write to CRM or contact an operational provider.

This boundary is enforced in depth. Static Assets attach the common `base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'` policy without routing every asset through the Worker. The Worker still runs first on ES/EN demo pages and replaces only the form boundary with `form-action 'none'`; `/api/leads` also rejects a same-origin demo referrer or demo `sourcePath` with `403 demo_submission_disabled` before rate limiting, coordination or provider delivery. Keep the Resend implementation active only for the landing and the explicitly authorised smoke tool. Any future demo form must retain the local interaction and the E2E zero-write guarantee.

### Smoke reproducible de Resend

La herramienta operativa usa el mismo `/api/leads` que la landing, no conoce secretos de Resend y permanece en modo seco por defecto. El payload identifica en nombre, alojamiento, campaña y mensaje que es una prueba técnica sin consentimiento comercial. La salida solo permite estado HTTP, `outcome`, referencia, repetición y espera del rate limit; nunca imprime el buzón de prueba, la respuesta completa ni valores del entorno.

1. Elige un identificador estable de 6–64 caracteres, por ejemplo `release-20260817-a`. Reutilizarlo con el mismo buzón conserva exactamente el mismo payload y comprueba la idempotencia durante 24 horas; cambiarlo crea deliberadamente un envío nuevo.
2. Comprueba primero el modo seco, que no hace peticiones:

   ```bash
   pnpm smoke:resend -- --run-id release-20260817-a
   ```

3. Solo desde un entorno autorizado, proporciona el buzón controlado que recibirá el resumen de visitante y la confirmación explícita. No pases el correo como argumento para evitar guardarlo en el historial del shell:

   ```bash
   export LOGIC_ESTANCIA_SMOKE_VISITOR_EMAIL='buzon-controlado@example.test'
   export LOGIC_ESTANCIA_SMOKE_AUTHORIZATION='SEND_IDENTIFIED_TEST_EMAIL'
   pnpm smoke:resend -- --execute --run-id release-20260817-a
   ```

4. Guarda la `ref` mostrada. Repite con el mismo entorno, `run-id` y `--expect-ref <ref>`; el resultado debe mantener la referencia y mostrar `replayed: true` sin crear otros correos.
5. En Resend, busca `estancia-lead/<ref>/internal` y `estancia-lead/<ref>/visitor`. Confirma que ambos aparecen entregados y que el mensaje interno está inequívocamente marcado como prueba. Verifica también la llegada a los dos buzones controlados antes de cerrar el smoke.
6. Borra las variables del shell al terminar con `unset LOGIC_ESTANCIA_SMOKE_VISITOR_EMAIL LOGIC_ESTANCIA_SMOKE_AUTHORIZATION`. Un `delivered_degraded`, una referencia distinta, un estado diferente de 202 o un `outcome` distinto de `delivered` hacen fallar la herramienta y requieren revisar los canales antes de reintentar.

No ejecutes esta comprobación contra producción sin autorización humana para generar los dos correos de prueba. No uses direcciones de prospectos, no actives HubSpot y no conviertas el smoke en un registro comercial.

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

## Versioned diagnostic, follow-up and proposal kit

The internal Spanish templates live in [`docs/commercial/templates`](commercial/templates/README.md) and currently use contract version `1.0.0`. The kit contains a diagnostic summary, a requested follow-up and a proposal draft. It does not provide prices or evidence for claims: operators must use only confirmed context, open the cited fictitious demo evidence and retain its visible boundary.

Run `pnpm commercial:template -- --validate` before using the kit. Use `--list` to inspect the exact input contract and `--example` to render clearly fictitious sample content. For an authorised case, pass JSON through standard input; the CLI returns Markdown through standard output, writes nothing and makes no network request. Generated documents and their PII must remain outside the repository under the applicable retention policy.

Before sending any output, a human must confirm the plan, scope, exclusions, dependencies, acceptance criteria and one dated or conditional next action. A response to a request does not grant marketing consent. Do not turn a demo into a claim of a live integration, and do not insert public or reusable pricing before the interview and proposal gate is met.

## Monthly review

Review the funnel in this order:

1. Assessment starts.
2. Assessment completion.
3. Optional contact submission.
4. Meetings.
5. Proposals.
6. Won and lost projects.

Change one main conversion hypothesis at a time. Keep the three canonical demos and five deep flows unless sales evidence justifies more scope.

The reproducible digital report is documented in [`docs/commercial/FUNNEL_REPORT.md`](commercial/FUNNEL_REPORT.md). It accepts only aggregated counts for the runtime allowlist and reports assessment starts, visible recommendations, delivered requests and optional meeting clicks. It deliberately excludes proposals, won/lost projects, revenue and objections, which require separate verified commercial evidence. Run `pnpm funnel:report -- --validate` to inspect the contract and `pnpm funnel:report -- --example` for a fictitious report before handling an authorised aggregate export.
