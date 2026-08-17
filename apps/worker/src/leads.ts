import { normalizePlanLevel, type PlanLevel } from '@logic-estancia/domain';
import { z } from 'zod';

export interface LeadEnv {
  LEADS_TRANSPORT?: 'resend' | 'disabled' | 'demo';
  LEADS_RESEND_API_KEY?: string;
  LEADS_FROM_EMAIL?: string;
  LEADS_INTERNAL_RECIPIENT?: string;
  LEADS_REPLY_TO?: string;
  LEADS_MEETING_URL?: string;
  HUBSPOT_ACCESS_TOKEN?: string;
  HUBSPOT_PIPELINE?: string;
  HUBSPOT_DEAL_STAGE?: string;
  LEAD_COORDINATOR?: DurableObjectNamespace;
}

const planInput = z.enum(['basico', 'gestion', 'inteligente', 'inicio', 'automatiza']);

const emailConfigurationSchema = z.object({
  apiKey: z.string().trim().min(1),
  fromEmail: z.string().trim().email().max(254),
  internalRecipient: z.string().trim().email().max(254),
  replyTo: z.string().trim().email().max(254),
});

const meetingUrlSchema = z.string().trim().max(500).url().refine((value) => {
  const url = new URL(value);
  return url.protocol === 'https:' && !url.username && !url.password;
}, 'meeting_url_must_be_public_https');

type EmailConfiguration = z.output<typeof emailConfigurationSchema>;
const emailEnvironmentNames = {
  apiKey: 'LEADS_RESEND_API_KEY',
  fromEmail: 'LEADS_FROM_EMAIL',
  internalRecipient: 'LEADS_INTERNAL_RECIPIENT',
  replyTo: 'LEADS_REPLY_TO',
} as const;

export const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  businessName: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(60).optional(),
  accommodationType: z.enum(['apartment', 'rural', 'hotel']),
  businessMode: z.enum(['mono', 'multi']).optional(),
  propertyCount: z.number().int().min(1).max(10_000),
  unitCount: z.number().int().min(1).max(100_000),
  plan: planInput.or(z.literal('')).optional(),
  currentStack: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  requestedCapabilities: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  timeline: z.enum(['0-3', '3-6', '6-12', 'exploring']).optional(),
  investmentRange: z.enum(['under-3k', '3k-8k', '8k-20k', '20k-plus', 'unknown']).optional(),
  sourcePath: z.string().trim().max(300).optional(),
  sourceCampaign: z.string().trim().max(160).optional(),
  marketingConsent: z.boolean().optional().default(false),
  message: z.string().trim().max(2_000).optional(),
  lang: z.enum(['es', 'en']).optional(),
  accept: z.literal(true),
  website: z.string().trim().max(200).optional(),
}).transform((lead) => ({ ...lead, email: lead.email.toLowerCase(), plan: lead.plan ? normalizePlanLevel(lead.plan as PlanLevel | 'inicio' | 'automatiza') : undefined }));

export type Lead = z.output<typeof leadSchema>;

export interface LeadCoordination {
  rateLimit(ip: string): Promise<number | null>;
  submit(fingerprint: string, lead: Lead): Promise<Response>;
}

export async function handleLead(request: Request, env: LeadEnv, coordination = cloudflareCoordination(env)): Promise<Response> {
  if (!coordination) return json({ ok: false, outcome: 'disabled', error: 'lead_coordination_unavailable' }, 503);
  const ip = request.headers.get('cf-connecting-ip') ?? 'local';
  let retryAfter: number | null;
  try { retryAfter = await coordination.rateLimit(ip); }
  catch {
    console.error(JSON.stringify({ event: 'lead_rate_limit_failed' }));
    return json({ ok: false, outcome: 'failed', error: 'lead_coordination_failed' }, 503);
  }
  if (retryAfter) return json({ ok: false, outcome: 'limited', error: 'rate_limited', retryAfter }, 429, { 'retry-after': String(retryAfter) });
  const raw: unknown = await request.json().catch(() => null);
  const bot = z.object({ website: z.string().optional() }).passthrough().safeParse(raw);
  if (bot.success && bot.data.website?.trim()) return json({ ok: true, outcome: 'received' }, 202);
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) return json({ ok: false, outcome: 'invalid', error: 'invalid', issues: parsed.error.issues }, 400);
  const lead = parsed.data;
  const transport = env.LEADS_TRANSPORT ?? (env.LEADS_RESEND_API_KEY ? 'resend' : 'disabled');
  if (transport === 'demo') return json({ ok: true, outcome: 'demo', meetingUrl: parseMeetingUrl(env.LEADS_MEETING_URL) }, 202);
  const expectedEmail = transport === 'resend';
  const emailConfiguration = expectedEmail ? parseEmailConfiguration(env) : null;
  const canEmail = Boolean(emailConfiguration);
  const canCrm = Boolean(env.HUBSPOT_ACCESS_TOKEN);
  if (expectedEmail && !emailConfiguration) logInvalidEmailConfiguration(env);
  if (!canEmail && !canCrm) return json({ ok: false, outcome: 'disabled', error: expectedEmail ? 'lead_email_configuration_invalid' : 'lead_delivery_disabled' }, 503);

  const fingerprint = await sha256(stableJson(lead));
  try {
    return await coordination.submit(fingerprint, lead);
  } catch {
    console.error(JSON.stringify({ event: 'lead_coordination_failed' }));
    return json({ ok: false, outcome: 'failed', error: 'lead_coordination_failed' }, 503);
  }
}

export async function deliverLead(lead: Lead, env: LeadEnv, ref: string): Promise<Response> {
  const transport = env.LEADS_TRANSPORT ?? (env.LEADS_RESEND_API_KEY ? 'resend' : 'disabled');
  const expectedEmail = transport === 'resend';
  const emailConfiguration = expectedEmail ? parseEmailConfiguration(env) : null;
  const canEmail = Boolean(emailConfiguration);
  const canCrm = Boolean(env.HUBSPOT_ACCESS_TOKEN);
  if (!canEmail && !canCrm) return json({ ok: false, outcome: 'disabled', error: expectedEmail ? 'lead_email_configuration_invalid' : 'lead_delivery_disabled' }, 503);

  const jobs: Promise<{ channel: string; ok: boolean }>[] = [];
  if (emailConfiguration) {
    jobs.push(sendInternalEmail(lead, ref, emailConfiguration).then((ok) => ({ channel: 'internal_email', ok })));
    jobs.push(sendVisitorSummary(lead, ref, emailConfiguration).then((ok) => ({ channel: 'visitor_email', ok })));
  } else if (expectedEmail) {
    jobs.push(Promise.resolve({ channel: 'email_configuration', ok: false }));
  }
  if (canCrm) jobs.push(syncHubSpot(lead, ref, env).then((ok) => ({ channel: 'hubspot', ok })));
  const results = await Promise.all(jobs);
  const delivered = results.some(({ ok }) => ok);
  if (!delivered) {
    console.error(JSON.stringify({ event: 'lead_delivery_failed', ref, channels: results }));
    return json({ ok: false, outcome: 'failed', error: 'lead_delivery_failed', ref }, 502);
  }
  const degraded = results.some(({ ok }) => !ok);
  if (degraded) console.error(JSON.stringify({ event: 'lead_delivery_degraded', ref, channels: results }));
  const meetingUrl = parseMeetingUrl(env.LEADS_MEETING_URL);
  if (!meetingUrl) console.error(JSON.stringify({ event: 'lead_meeting_configuration_invalid', reason: env.LEADS_MEETING_URL ? 'invalid' : 'missing' }));
  return json({ ok: true, outcome: degraded ? 'delivered_degraded' : 'delivered', ref, meetingUrl }, 202);
}

function parseEmailConfiguration(env: LeadEnv): EmailConfiguration | null {
  const parsed = emailConfigurationSchema.safeParse({
    apiKey: env.LEADS_RESEND_API_KEY,
    fromEmail: env.LEADS_FROM_EMAIL,
    internalRecipient: env.LEADS_INTERNAL_RECIPIENT,
    replyTo: env.LEADS_REPLY_TO,
  });
  return parsed.success ? parsed.data : null;
}

function logInvalidEmailConfiguration(env: LeadEnv): void {
  const parsed = emailConfigurationSchema.safeParse({
    apiKey: env.LEADS_RESEND_API_KEY,
    fromEmail: env.LEADS_FROM_EMAIL,
    internalRecipient: env.LEADS_INTERNAL_RECIPIENT,
    replyTo: env.LEADS_REPLY_TO,
  });
  if (parsed.success) return;
  const fields = [...new Set(parsed.error.issues.map((issue) => {
    const field = issue.path[0];
    return typeof field === 'string' && field in emailEnvironmentNames
      ? emailEnvironmentNames[field as keyof typeof emailEnvironmentNames]
      : 'unknown';
  }))];
  console.error(JSON.stringify({ event: 'lead_email_configuration_invalid', fields }));
}

function parseMeetingUrl(value: string | undefined): string | null {
  const parsed = meetingUrlSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function cloudflareCoordination(env: LeadEnv): LeadCoordination | null {
  if (!env.LEAD_COORDINATOR) return null;
  let namespace = env.LEAD_COORDINATOR;
  try { namespace = namespace.jurisdiction('eu'); }
  catch { /* workerd local does not implement jurisdiction restrictions. */ }
  return {
    async rateLimit(ip) {
      const key = await sha256(ip);
      const response = await namespace.getByName(`rate:${key}`).fetch('https://lead-coordinator/rate-limit', { method: 'POST' });
      if (!response.ok) throw new Error('rate_limit_unavailable');
      const body = await response.json() as { retryAfter?: number | null };
      return body.retryAfter ?? null;
    },
    submit(fingerprint, lead) {
      return namespace.getByName(`lead:${fingerprint}`).fetch('https://lead-coordinator/deliver', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(lead),
      });
    },
  };
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

async function sha256(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function leadRows(lead: Lead): [string, string][] {
  return [
    ['Alojamiento', lead.businessName], ['Nombre', lead.name], ['Email', lead.email], ['Teléfono', lead.phone || '—'],
    ['Tipo', lead.accommodationType], ['Modelo', lead.businessMode || '—'], ['Propiedades', String(lead.propertyCount)],
    ['Unidades', String(lead.unitCount)], ['Plan recomendado', lead.plan || '—'], ['Situación actual', lead.currentStack?.join(', ') || '—'],
    ['Capacidades', lead.requestedCapabilities?.join(', ') || '—'], ['Plazo', lead.timeline || '—'], ['Inversión', lead.investmentRange || '—'],
    ['Idioma', lead.lang || '—'], ['Origen', lead.sourcePath || '—'], ['Campaña', lead.sourceCampaign || '—'],
    ['Consentimiento comercial', lead.marketingConsent ? 'Sí' : 'No'], ['Privacidad', 'Aceptada para responder'],
  ];
}

async function resend(apiKey: string, idempotencyKey: string, payload: Record<string, unknown>): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json', 'idempotency-key': idempotencyKey }, body: JSON.stringify(payload) });
    return response.ok;
  } catch { return false; }
}

async function sendInternalEmail(lead: Lead, ref: string, configuration: EmailConfiguration): Promise<boolean> {
  const rows = leadRows(lead); const subject = `${lead.plan ? `Plan ${lead.plan}` : 'Proyecto'} · ${lead.businessName}`;
  const text = `Nueva solicitud — Logic Estancia\n\n${rows.map(([key, value]) => `${key}: ${value}`).join('\n')}\n\nMensaje:\n${lead.message || '—'}\n\nReferencia: ${ref}`;
  const html = `<h2>Nueva solicitud — Logic Estancia</h2><table>${rows.map(([key, value]) => `<tr><td><strong>${escapeHtml(key)}</strong></td><td>${escapeHtml(value)}</td></tr>`).join('')}</table><p><strong>Mensaje</strong><br>${escapeHtml(lead.message || '—')}</p><p>Referencia: ${escapeHtml(ref)}</p>`;
  return resend(configuration.apiKey, `estancia-lead/${ref}/internal`, { from: `Logic Estancia <${configuration.fromEmail}>`, to: [configuration.internalRecipient], reply_to: lead.email, subject, html, text });
}

async function sendVisitorSummary(lead: Lead, ref: string, configuration: EmailConfiguration): Promise<boolean> {
  const plan = lead.plan ?? 'basico';
  const names = lead.lang === 'en' ? { basico: 'Basic', gestion: 'Management', inteligente: 'Intelligent' } : { basico: 'Básico', gestion: 'Gestión', inteligente: 'Inteligente' };
  const en = lead.lang === 'en'; const subject = en ? `Your Logic Estancia assessment · ${names[plan]}` : `Tu diagnóstico Logic Estancia · ${names[plan]}`;
  const intro = en ? `Hello ${lead.name}, your initial recommendation is ${names[plan]}.` : `Hola ${lead.name}, tu recomendación inicial es ${names[plan]}.`;
  const followup = en ? 'We will review your context and reply within one business day.' : 'Revisaremos tu contexto y responderemos en un día laborable.';
  const text = `${intro}\n\n${followup}\n\n${en ? 'Requested capabilities' : 'Capacidades solicitadas'}: ${lead.requestedCapabilities?.join(', ') || '—'}\n\n${en ? 'Reference' : 'Referencia'}: ${ref}`;
  const html = `<h2>${escapeHtml(intro)}</h2><p>${escapeHtml(followup)}</p><p><strong>${en ? 'Requested capabilities' : 'Capacidades solicitadas'}</strong><br>${escapeHtml(lead.requestedCapabilities?.join(', ') || '—')}</p><p>${en ? 'Reference' : 'Referencia'}: ${escapeHtml(ref)}</p>`;
  return resend(configuration.apiKey, `estancia-lead/${ref}/visitor`, { from: `Logic Estancia <${configuration.fromEmail}>`, to: [lead.email], reply_to: configuration.replyTo, subject, html, text });
}

async function hubspotRequest(path: string, token: string, init: RequestInit): Promise<Response | null> {
  try { return await fetch(`https://api.hubapi.com${path}`, { ...init, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(init.headers || {}) } }); }
  catch { return null; }
}

async function syncHubSpot(lead: Lead, ref: string, env: LeadEnv): Promise<boolean> {
  const token = env.HUBSPOT_ACCESS_TOKEN!;
  const search = await hubspotRequest('/crm/v3/objects/contacts/search', token, { method: 'POST', body: JSON.stringify({ filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: lead.email }] }], properties: ['email'], limit: 1 }) });
  if (!search?.ok) return false;
  const searchBody = await search.json() as { results?: { id: string }[] };
  const [firstName, ...surname] = lead.name.trim().split(/\s+/);
  const properties = { email: lead.email, firstname: firstName, lastname: surname.join(' '), company: lead.businessName, phone: lead.phone || '' };
  const enrichedProperties = {
    ...properties,
    logic_estancia_accommodation_type: lead.accommodationType,
    logic_estancia_business_mode: lead.businessMode || '',
    logic_estancia_property_count: String(lead.propertyCount),
    logic_estancia_unit_count: String(lead.unitCount),
    logic_estancia_recommended_plan: lead.plan || '',
    logic_estancia_timeline: lead.timeline || '',
    logic_estancia_investment_range: lead.investmentRange || '',
    logic_estancia_requested_capabilities: lead.requestedCapabilities?.join(';') || '',
    logic_estancia_source_path: lead.sourcePath || '',
    logic_estancia_marketing_consent: lead.marketingConsent ? 'true' : 'false',
  };
  let contactId = searchBody.results?.[0]?.id;
  const contactPath = contactId ? `/crm/v3/objects/contacts/${contactId}` : '/crm/v3/objects/contacts';
  const contactMethod = contactId ? 'PATCH' : 'POST';
  let contact = await hubspotRequest(contactPath, token, { method: contactMethod, body: JSON.stringify({ properties: enrichedProperties }) });
  if (contact && !contact.ok) contact = await hubspotRequest(contactPath, token, { method: contactMethod, body: JSON.stringify({ properties }) });
  if (!contact?.ok) return false;
  if (!contactId) contactId = ((await contact.json()) as { id?: string }).id;
  if (!contactId) return false;
  const existingDeal = await hubspotRequest('/crm/v3/objects/deals/search', token, {
    method: 'POST',
    body: JSON.stringify({ filterGroups: [{ filters: [{ propertyName: 'logic_estancia_submission_id', operator: 'EQ', value: ref }] }], properties: ['logic_estancia_submission_id'], limit: 1 }),
  });
  if (!existingDeal?.ok) return false;
  const existingDealBody = await existingDeal.json() as { results?: { id: string }[] };
  if (existingDealBody.results?.[0]?.id) return true;
  const description = leadRows(lead).map(([key, value]) => `${key}: ${value}`).join('\n');
  const deal = await hubspotRequest('/crm/v3/objects/deals', token, { method: 'POST', body: JSON.stringify({ properties: { dealname: `${lead.businessName} · ${lead.plan || 'diagnóstico'}`, pipeline: env.HUBSPOT_PIPELINE || 'default', dealstage: env.HUBSPOT_DEAL_STAGE || 'appointmentscheduled', description: `${description}\nReferencia: ${ref}`, logic_estancia_submission_id: ref }, associations: [{ to: { id: contactId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] }] }) });
  if (deal?.ok) return true;
  const retrySearch = await hubspotRequest('/crm/v3/objects/deals/search', token, {
    method: 'POST',
    body: JSON.stringify({ filterGroups: [{ filters: [{ propertyName: 'logic_estancia_submission_id', operator: 'EQ', value: ref }] }], properties: ['logic_estancia_submission_id'], limit: 1 }),
  });
  if (!retrySearch?.ok) return false;
  const retryBody = await retrySearch.json() as { results?: { id: string }[] };
  return Boolean(retryBody.results?.[0]?.id);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } });
}
