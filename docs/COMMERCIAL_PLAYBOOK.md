# Logic2B Estancias · Commercial playbook

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

## Runtime safety modes

The normative runtime contract is [`docs/DEMO_MODE.md`](DEMO_MODE.md). The product demo is fail-closed and requires no real secrets. Product operations are eligible only when both conditions are literal and explicit:

```text
DEMO_MODE=false
REAL_OPERATIONS_ENABLED=true
```

The only exception is Logic2B Estancias' own commercial lead capture: it may coexist with `DEMO_MODE=true`, but only with `COMMERCIAL_LEADS_ENABLED=true`, `EMAIL_PROVIDER_MODE=resend`, `LEADS_TRANSPORT=resend` and complete validated Resend configuration. Missing, empty or unknown values keep it disabled before the body is read. Provider selection is an additional gate, never a fallback:

- `EMAIL_PROVIDER_MODE=disabled` by default; `capture`/`mock` are reserved for isolated harnesses and currently resolve without output; `resend` is eligible only for the explicit commercial-lead allowlist.
- `ANALYTICS_PROVIDER_MODE=disabled` in demo; `capture`/`mock` are reserved for isolated harnesses and currently resolve without output; `gtm` is eligible only in real mode and after consent.

The presence of a secret, Durable Object binding, route, table or old environment value does not activate a capability. “Visible in the demo” and “active in production” are separate claims.

## Lead environment configuration

Configure the mode gates in the Cloudflare Worker environment, never in tracked source:

- `DEMO_MODE`: only literal `false` permits evaluation of real operations.
- `REAL_OPERATIONS_ENABLED`: must be literal `true` as a second authorization for product operations.
- `COMMERCIAL_LEADS_ENABLED`: must be literal `true` before any commercial form may submit, including when product demo mode remains true.
- `EMAIL_PROVIDER_MODE`: use `disabled` by default; use `resend` only in an approved commercial-lead deployment.
- `ANALYTICS_PROVIDER_MODE`: use `disabled` by default; use `gtm` only in an approved real deployment with consent handling.

Only an isolated real email deployment may also configure:

- `LEADS_RESEND_API_KEY`: Resend credential.
- `LEADS_FROM_EMAIL`: verified sender address shown under the Logic2B Estancias name.
- `LEADS_INTERNAL_RECIPIENT`: internal mailbox that receives the complete request.
- `LEADS_REPLY_TO`: monitored address used when the visitor replies to their summary.
- `LEADS_MEETING_URL`: public HTTPS scheduling URL, without embedded credentials.

In production, `LEADS_INTERNAL_RECIPIENT` is `marinerandreu+logic@gmail.com`. Email delivery is only eligible when `COMMERCIAL_LEADS_ENABLED=true`, `EMAIL_PROVIDER_MODE=resend`, the API key and all three addresses pass validation; otherwise the endpoint fails closed. A missing or invalid meeting URL is never rendered as a link.

Use `apps/worker/.dev.vars.example` only as a local shape reference. Definitive addresses and the scheduling URL require human validation before deployment.

## Lead delivery resilience and recovery

Cloudflare Durable Objects keep the five-submissions-per-minute IP limit outside individual Worker isolates. They also retain a submission reference for one fixed 24-hour window from the first delivery attempt in the EU jurisdiction; a completed response is cached only for the remainder of that same window. Failed attempts schedule the same expiry, equivalent retries do not extend it, and Resend receives `estancia-lead/{ref}/internal` and `estancia-lead/{ref}/visitor` idempotency keys.

The expiry alarm is lifecycle cleanup, not a business job. It can delete only transient quota/idempotency metadata in an isolated deployment whose `DEMO_MODE=false`, including `real_locked` while operations and providers are disabled. Under `DEMO_MODE=true` the alarm is a strict no-op. Rollback therefore routes traffic to a separate demo Worker and namespace, leaves the isolated real Worker locked for at most the original 24-hour expiry window, verifies cleanup and only then archives or purges that namespace. Never overwrite a real namespace with demo configuration as a shortcut.

Use the structured Worker log event and its `ref` when a provider is degraded:

1. For `lead_delivery_degraded`, the internal request is already delivered but the visitor summary failed. Use the reference to verify the internal message before deciding whether to acknowledge it manually.
2. In Resend, inspect both idempotency keys for that reference before resending a message.
3. For `lead_delivery_failed`, retry the unchanged payload within 24 hours; changing any lead field intentionally creates a different submission identity.
4. If `lead_coordination_failed` appears, restore the Durable Object binding before retrying. The endpoint fails closed instead of bypassing rate limiting or idempotency.
5. For `lead_email_configuration_invalid`, repair every named field before relying on Resend. For `lead_meeting_configuration_invalid`, verify the public HTTPS agenda value; no unsafe value is returned to the browser.

An internal Resend message is the mandatory delivery. A visitor summary without the internal message is a failed submission, returns `502` and remains retryable with the same durable reference during its original 24-hour window; an internal message without the visitor summary returns `202 delivered_degraded`. Each Resend request is aborted after 10 seconds so a stalled provider cannot hold the form indefinitely. A timeout follows the same failed/degraded contract, and retrying the unchanged payload within that window remains safe because both messages keep their stable idempotency keys. After expiry, a retry intentionally starts a new reference and must be treated as a new delivery attempt. Do not create CRM records while HubSpot remains outside the production scope.

### Demo form boundary

Only the commercial form on the Logic2B Estancias homepage may call `/api/leads`; segment landings navigate to that single form and preserve only an allowlisted origin. It becomes eligible for Resend only with `COMMERCIAL_LEADS_ENABLED=true` and complete email configuration; product demo mode may remain true. Without that allowlist, the endpoint returns `403` before reading the body, rate limiting, durable coordination or provider resolution. The interface must explain that no request was sent rather than showing a real-delivery receipt.

Nivora, Terrava, Aurem and their workspaces are fictitious visual fixtures. Their panels collect no visitor data and must never send email, create a lead, write to CRM, mutate inventory, create a booking or payment, publish content, start a job or contact an operational provider.

This boundary is enforced in depth. The global mode guard is authoritative and cannot depend on `Referer`, `sourcePath` or browser controls. Every Static Asset passes through the Worker: demo and locked modes receive an isolated Content Security Policy with `form-action 'none'`, while provider origins are admitted only by the explicitly activated real analytics policy. Demo routes additionally use `connect-src 'none'` in every runtime mode, so their browser code cannot reach even a same-origin API. Encoded demo sources are rejected as a supplementary guard. Any future demo interaction must retain the E2E zero-write guarantee.

### Smoke reproducible de Resend

La herramienta operativa usa el mismo `/api/leads` que la landing, no conoce secretos de Resend y permanece en modo seco por defecto. El payload identifica en nombre, alojamiento, campaña y mensaje que es una prueba técnica sin consentimiento comercial. La salida solo permite estado HTTP, `outcome`, referencia, repetición y espera del rate limit; nunca imprime el buzón de prueba, la respuesta completa ni valores del entorno.

1. Elige un identificador estable de 6–64 caracteres, por ejemplo `release-20260817-a`. Reutilizarlo con el mismo buzón conserva exactamente el mismo payload y comprueba la idempotencia durante 24 horas; cambiarlo crea deliberadamente un envío nuevo.
2. Comprueba primero el modo seco, que no hace peticiones:

   ```bash
   pnpm smoke:resend -- --run-id release-20260817-a
   ```

3. Solo desde un entorno autorizado, proporciona el buzón controlado que recibirá el resumen de visitante y la confirmación explícita. No pases el correo como argumento para evitar guardarlo en el historial del shell:

   ```bash
   export DEMO_MODE='false'
   export LOGIC_ESTANCIA_SMOKE_VISITOR_EMAIL='buzon-controlado@example.test'
   export LOGIC_ESTANCIA_SMOKE_AUTHORIZATION='SEND_IDENTIFIED_TEST_EMAIL'
   pnpm smoke:resend -- --execute --run-id release-20260817-a
   ```

4. Guarda la `ref` mostrada. Repite con el mismo entorno, `run-id` y `--expect-ref <ref>`; el resultado debe mantener la referencia y mostrar `replayed: true` sin crear otros correos.
5. En Resend, busca `estancia-lead/<ref>/internal` y `estancia-lead/<ref>/visitor`. Confirma que ambos aparecen entregados y que el mensaje interno está inequívocamente marcado como prueba. Verifica también la llegada a los dos buzones controlados antes de cerrar el smoke.
6. Borra las variables del shell al terminar con `unset DEMO_MODE LOGIC_ESTANCIA_SMOKE_VISITOR_EMAIL LOGIC_ESTANCIA_SMOKE_AUTHORIZATION`. Un `delivered_degraded`, una referencia distinta, un estado diferente de 202 o un `outcome` distinto de `delivered` hacen fallar la herramienta y requieren revisar los canales antes de reintentar.

No ejecutes esta comprobación contra una demo: debe responder de forma cerrada y nunca entregar correo. Tampoco la ejecutes contra producción sin autorización humana para generar los dos correos de prueba. No uses direcciones de prospectos, no actives HubSpot y no conviertas el smoke en un registro comercial.

## GA4/GTM contract

GTM is disabled unconditionally in demo mode, even when a browser retains prior analytics consent. A controlled analytics deployment requires the three explicit gates `DEMO_MODE=false`, `REAL_OPERATIONS_ENABLED=true` and `ANALYTICS_PROVIDER_MODE=gtm`; consent alone never activates the provider. Keep `COMMERCIAL_LEADS_ENABLED=false` and every unrelated provider disabled unless each has a separate approval.

Only configure the allowlisted events emitted by the site:

- `solution_view`, `plan_select`
- `assessment_start`, `assessment_step`, `assessment_submit`, `assessment_complete`
- `demo_open`, `demo_mode_select`, `demo_step_complete`, `demo_flow_complete`, `demo_cta`
- `lead_submit`, `meeting_click`, `cta_click`

Allowed parameters are locale, segment, plan, demo, flow, step index and source section. Names, emails, phone numbers, dates, amounts, messages and demo state must never be sent.

Before activation, configure Estancia-specific tags, triggers and parameter mappings inside the shared `GTM-TVDWZ9LC` container without changing Camp. Browser emission and the offline report consume the same canonical event shapes from `packages/config/src/analytics-contract.json`; incomplete events or event-incompatible dimensions are discarded or rejected. Deploying the current build and changing runtime gates both require explicit rollout approval, followed by a production check of the capability manifest, consent, CSP and exact `dataLayer` shapes before the baseline period begins.

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
2. Valid assessment submissions.
3. Recommendations shown.
4. Optional contact submission.
5. Meetings.
6. Proposals.
7. Won and lost projects.

Change one main conversion hypothesis at a time. Keep the three canonical demos and five deep flows unless sales evidence justifies more scope.

The reproducible digital report is documented in [`docs/commercial/FUNNEL_REPORT.md`](commercial/FUNNEL_REPORT.md). It accepts only aggregated counts for the runtime allowlist and reports assessment starts, valid final submissions, visible recommendations, delivered requests and optional meeting clicks. Diagnostic rates require `source_section=assessment`; the homepage scope recommendation remains visible only in event totals. It deliberately excludes proposals, won/lost projects, revenue and objections, which require separate verified commercial evidence. Run `pnpm funnel:report -- --validate` to inspect the contract and `pnpm funnel:report -- --example` for a fictitious report before handling an authorised aggregate export.
