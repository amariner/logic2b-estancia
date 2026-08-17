import { normalizePlanLevel, type PlanLevel } from '@logic-estancia/domain';
import { z } from 'zod';

export interface LeadEnv {
  LEADS_TRANSPORT?: 'resend' | 'disabled' | 'demo';
  LEADS_RESEND_API_KEY?: string;
  HUBSPOT_ACCESS_TOKEN?: string;
  HUBSPOT_PIPELINE?: string;
  HUBSPOT_DEAL_STAGE?: string;
}

const planInput = z.enum(['basico', 'gestion', 'inteligente', 'inicio', 'automatiza']);

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
}).transform((lead) => ({ ...lead, plan: lead.plan ? normalizePlanLevel(lead.plan as PlanLevel | 'inicio' | 'automatiza') : undefined }));

export type Lead = z.output<typeof leadSchema>;

const buckets = new Map<string, number[]>();
const LIMIT = 5;
const WINDOW = 60_000;

function limited(ip: string, now = Date.now()): number | null {
  const current = (buckets.get(ip) ?? []).filter((stamp) => now - stamp < WINDOW);
  if (current.length >= LIMIT) {
    buckets.set(ip, current);
    return Math.ceil((WINDOW - (now - current[0]!)) / 1000);
  }
  current.push(now);
  buckets.set(ip, current);
  return null;
}

export async function handleLead(request: Request, env: LeadEnv): Promise<Response> {
  const retryAfter = limited(request.headers.get('cf-connecting-ip') ?? 'local');
  if (retryAfter) return json({ ok: false, outcome: 'limited', error: 'rate_limited', retryAfter }, 429, { 'retry-after': String(retryAfter) });
  const raw: unknown = await request.json().catch(() => null);
  const bot = z.object({ website: z.string().optional() }).passthrough().safeParse(raw);
  if (bot.success && bot.data.website?.trim()) return json({ ok: true, outcome: 'received' }, 202);
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) return json({ ok: false, outcome: 'invalid', error: 'invalid', issues: parsed.error.issues }, 400);
  const lead = parsed.data;
  const transport = env.LEADS_TRANSPORT ?? (env.LEADS_RESEND_API_KEY ? 'resend' : 'disabled');
  if (transport === 'demo') return json({ ok: true, outcome: 'demo' }, 202);
  const canEmail = transport === 'resend' && Boolean(env.LEADS_RESEND_API_KEY);
  const canCrm = Boolean(env.HUBSPOT_ACCESS_TOKEN);
  if (!canEmail && !canCrm) return json({ ok: false, outcome: 'disabled', error: 'lead_delivery_disabled' }, 503);

  const ref = crypto.randomUUID();
  const jobs: Promise<{ channel: string; ok: boolean }>[] = [];
  if (canEmail) {
    jobs.push(sendInternalEmail(lead, ref, env.LEADS_RESEND_API_KEY!).then((ok) => ({ channel: 'internal_email', ok })));
    jobs.push(sendVisitorSummary(lead, ref, env.LEADS_RESEND_API_KEY!).then((ok) => ({ channel: 'visitor_email', ok })));
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
  return json({ ok: true, outcome: degraded ? 'delivered_degraded' : 'delivered', ref }, 202);
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

async function sendInternalEmail(lead: Lead, ref: string, apiKey: string): Promise<boolean> {
  const rows = leadRows(lead); const subject = `${lead.plan ? `Plan ${lead.plan}` : 'Proyecto'} · ${lead.businessName}`;
  const text = `Nueva solicitud — Logic Estancia\n\n${rows.map(([key, value]) => `${key}: ${value}`).join('\n')}\n\nMensaje:\n${lead.message || '—'}\n\nReferencia: ${ref}`;
  const html = `<h2>Nueva solicitud — Logic Estancia</h2><table>${rows.map(([key, value]) => `<tr><td><strong>${escapeHtml(key)}</strong></td><td>${escapeHtml(value)}</td></tr>`).join('')}</table><p><strong>Mensaje</strong><br>${escapeHtml(lead.message || '—')}</p><p>Referencia: ${escapeHtml(ref)}</p>`;
  return resend(apiKey, `estancia-lead/${ref}/internal`, { from: 'Logic Estancia <leads@logic2b.com>', to: ['marinerandreu@gmail.com'], reply_to: lead.email, subject, html, text });
}

async function sendVisitorSummary(lead: Lead, ref: string, apiKey: string): Promise<boolean> {
  const plan = lead.plan ?? 'basico';
  const names = lead.lang === 'en' ? { basico: 'Basic', gestion: 'Management', inteligente: 'Intelligent' } : { basico: 'Básico', gestion: 'Gestión', inteligente: 'Inteligente' };
  const en = lead.lang === 'en'; const subject = en ? `Your Logic Estancia assessment · ${names[plan]}` : `Tu diagnóstico Logic Estancia · ${names[plan]}`;
  const intro = en ? `Hello ${lead.name}, your initial recommendation is ${names[plan]}.` : `Hola ${lead.name}, tu recomendación inicial es ${names[plan]}.`;
  const followup = en ? 'We will review your context and reply within one business day.' : 'Revisaremos tu contexto y responderemos en un día laborable.';
  const text = `${intro}\n\n${followup}\n\n${en ? 'Requested capabilities' : 'Capacidades solicitadas'}: ${lead.requestedCapabilities?.join(', ') || '—'}\n\n${en ? 'Reference' : 'Referencia'}: ${ref}`;
  const html = `<h2>${escapeHtml(intro)}</h2><p>${escapeHtml(followup)}</p><p><strong>${en ? 'Requested capabilities' : 'Capacidades solicitadas'}</strong><br>${escapeHtml(lead.requestedCapabilities?.join(', ') || '—')}</p><p>${en ? 'Reference' : 'Referencia'}: ${escapeHtml(ref)}</p>`;
  return resend(apiKey, `estancia-lead/${ref}/visitor`, { from: 'Logic Estancia <leads@logic2b.com>', to: [lead.email], reply_to: 'marinerandreu@gmail.com', subject, html, text });
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
  const description = leadRows(lead).map(([key, value]) => `${key}: ${value}`).join('\n');
  const deal = await hubspotRequest('/crm/v3/objects/deals', token, { method: 'POST', body: JSON.stringify({ properties: { dealname: `${lead.businessName} · ${lead.plan || 'diagnóstico'}`, pipeline: env.HUBSPOT_PIPELINE || 'default', dealstage: env.HUBSPOT_DEAL_STAGE || 'appointmentscheduled', description: `${description}\nReferencia: ${ref}` }, associations: [{ to: { id: contactId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] }] }) });
  return Boolean(deal?.ok);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } });
}
