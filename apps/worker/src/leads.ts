import { normalizePlanLevel, type PlanLevel } from '@logic-estancia/domain';
import { z } from 'zod';

export interface LeadEnv {
  LEADS_TRANSPORT?: 'resend' | 'disabled' | 'demo';
  LEADS_RESEND_API_KEY?: string;
  LEADS_FROM_EMAIL?: string;
  LEADS_INTERNAL_RECIPIENT?: string;
  LEADS_REPLY_TO?: string;
  LEADS_MEETING_URL?: string;
  LEAD_COORDINATOR?: DurableObjectNamespace;
}

const planInput = z.enum(['basico', 'gestion', 'inteligente', 'inicio', 'automatiza']);
const RESEND_TIMEOUT_MS = 10_000;
const MAX_LEAD_BODY_BYTES = 32 * 1_024;
const requiredSingleLine = (max: number) => z.string().trim().min(1).max(max).regex(/^[^\r\n\u2028\u2029]*$/);
const optionalSingleLine = (max: number) => z.string().trim().max(max).regex(/^[^\r\n\u2028\u2029]*$/);

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
  name: requiredSingleLine(120),
  businessName: requiredSingleLine(160),
  email: optionalSingleLine(200).email(),
  phone: optionalSingleLine(60).optional(),
  accommodationType: z.enum(['apartment', 'rural', 'hotel']),
  businessMode: z.enum(['mono', 'multi']).optional(),
  propertyCount: z.number().int().min(1).max(10_000),
  unitCount: z.number().int().min(1).max(100_000),
  plan: planInput.or(z.literal('')).optional(),
  currentStack: z.array(requiredSingleLine(60)).max(20).optional(),
  requestedCapabilities: z.array(requiredSingleLine(60)).max(30).optional(),
  timeline: z.enum(['0-3', '3-6', '6-12', 'exploring']).optional(),
  investmentRange: z.enum(['under-3k', '3k-8k', '8k-20k', '20k-plus', 'unknown']).optional(),
  sourcePath: optionalSingleLine(300).optional(),
  sourceCampaign: optionalSingleLine(160).optional(),
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

export function isDemoPath(pathname: string): boolean {
  let normalized = pathname;
  try {
    for (let pass = 0; pass < 3; pass += 1) {
      const decoded = decodeURIComponent(normalized);
      if (decoded === normalized) break;
      normalized = decoded;
    }
  } catch { return false; }
  return /^\/(?:en\/)?demos(?:\/|$)/.test(normalized);
}

export async function handleLead(request: Request, env: LeadEnv, coordination = cloudflareCoordination(env)): Promise<Response> {
  // Demo forms are deliberately local fixtures. This server-side guard keeps a
  // future accidental fetch from turning them into Resend or CRM submissions.
  if (hasDemoReferrer(request)) return json({ ok: false, outcome: 'blocked', error: 'demo_submission_disabled' }, 403);
  // Browsers expose enough context to reject cross-site form abuse before it
  // consumes rate-limit capacity. Server-side smoke checks omit these headers.
  if (isCrossSiteBrowserRequest(request)) return json({ ok: false, outcome: 'blocked', error: 'cross_site_submission_disabled' }, 403);
  if (declaredBodyTooLarge(request)) return json({ ok: false, outcome: 'invalid', error: 'payload_too_large' }, 413);
  if (!coordination) return json({ ok: false, outcome: 'disabled', error: 'lead_coordination_unavailable' }, 503);
  const ip = request.headers.get('cf-connecting-ip') ?? 'local';
  let retryAfter: number | null;
  try { retryAfter = await coordination.rateLimit(ip); }
  catch {
    console.error(JSON.stringify({ event: 'lead_rate_limit_failed' }));
    return json({ ok: false, outcome: 'failed', error: 'lead_coordination_failed' }, 503);
  }
  if (retryAfter) return json({ ok: false, outcome: 'limited', error: 'rate_limited', retryAfter }, 429, { 'retry-after': String(retryAfter) });
  const parsedBody = await readBoundedJson(request);
  if (parsedBody.tooLarge) return json({ ok: false, outcome: 'invalid', error: 'payload_too_large' }, 413);
  const raw = parsedBody.value;
  const bot = z.object({ website: z.string().optional() }).passthrough().safeParse(raw);
  if (bot.success && bot.data.website?.trim()) return json({ ok: true, outcome: 'received' }, 202);
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) return json({ ok: false, outcome: 'invalid', error: 'invalid' }, 400);
  const lead = parsed.data;
  if (lead.sourcePath && isDemoPath(lead.sourcePath)) return json({ ok: false, outcome: 'blocked', error: 'demo_submission_disabled' }, 403);
  const transport = env.LEADS_TRANSPORT ?? (env.LEADS_RESEND_API_KEY ? 'resend' : 'disabled');
  if (transport === 'demo') return json({ ok: true, outcome: 'demo', meetingUrl: parseMeetingUrl(env.LEADS_MEETING_URL) }, 202);
  if (transport !== 'resend') return json({ ok: false, outcome: 'disabled', error: 'lead_delivery_disabled' }, 503);
  const emailConfiguration = parseEmailConfiguration(env);
  if (!emailConfiguration) {
    logInvalidEmailConfiguration(env);
    return json({ ok: false, outcome: 'disabled', error: 'lead_email_configuration_invalid' }, 503);
  }

  const fingerprint = await sha256(stableJson(lead));
  try {
    return await coordination.submit(fingerprint, lead);
  } catch {
    console.error(JSON.stringify({ event: 'lead_coordination_failed' }));
    return json({ ok: false, outcome: 'failed', error: 'lead_coordination_failed' }, 503);
  }
}

function hasDemoReferrer(request: Request): boolean {
  const referrer = request.headers.get('referer');
  if (!referrer) return false;
  try {
    const requestUrl = new URL(request.url);
    const referrerUrl = new URL(referrer);
    return requestUrl.origin === referrerUrl.origin && isDemoPath(referrerUrl.pathname);
  } catch {
    return false;
  }
}

function isCrossSiteBrowserRequest(request: Request): boolean {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return true;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).origin !== new URL(request.url).origin; }
  catch { return true; }
}

function declaredBodyTooLarge(request: Request): boolean {
  const value = request.headers.get('content-length');
  if (!value) return false;
  return /^\d+$/.test(value) && Number(value) > MAX_LEAD_BODY_BYTES;
}

async function readBoundedJson(request: Request): Promise<{ value: unknown; tooLarge: boolean }> {
  if (!request.body) return { value: null, tooLarge: false };
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_LEAD_BODY_BYTES) {
      await reader.cancel();
      return { value: null, tooLarge: true };
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  try { return { value: JSON.parse(text), tooLarge: false }; }
  catch { return { value: null, tooLarge: false }; }
}

export async function deliverLead(lead: Lead, env: LeadEnv, ref: string): Promise<Response> {
  const transport = env.LEADS_TRANSPORT ?? (env.LEADS_RESEND_API_KEY ? 'resend' : 'disabled');
  if (transport !== 'resend') return json({ ok: false, outcome: 'disabled', error: 'lead_delivery_disabled' }, 503);
  const emailConfiguration = parseEmailConfiguration(env);
  if (!emailConfiguration) return json({ ok: false, outcome: 'disabled', error: 'lead_email_configuration_invalid' }, 503);

  const [internalOk, visitorOk] = await Promise.all([
    sendInternalEmail(lead, ref, emailConfiguration),
    sendVisitorSummary(lead, ref, emailConfiguration),
  ]);
  const results = [
    { channel: 'internal_email', ok: internalOk },
    { channel: 'visitor_email', ok: visitorOk },
  ];
  if (!internalOk) {
    console.error(JSON.stringify({ event: 'lead_delivery_failed', ref, channels: results }));
    return json({ ok: false, outcome: 'failed', error: 'lead_delivery_failed', ref }, 502);
  }
  const degraded = !visitorOk;
  if (degraded) console.error(JSON.stringify({ event: 'lead_delivery_degraded', ref, channels: results }));
  const meetingUrl = parseMeetingUrl(env.LEADS_MEETING_URL);
  if (env.LEADS_MEETING_URL && !meetingUrl) {
    console.error(JSON.stringify({ event: 'lead_meeting_configuration_invalid', reason: 'invalid' }));
  }
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RESEND_TIMEOUT_MS);
  try {
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json', 'idempotency-key': idempotencyKey }, body: JSON.stringify(payload), signal: controller.signal });
    return response.ok;
  } catch { return false; }
  finally { clearTimeout(timeout); }
}

async function sendInternalEmail(lead: Lead, ref: string, configuration: EmailConfiguration): Promise<boolean> {
  const rows = leadRows(lead); const subject = `${lead.plan ? `Plan ${lead.plan}` : 'Proyecto'} · ${lead.businessName}`;
  const text = `Nueva solicitud — Logic Estancia\n\n${rows.map(([key, value]) => `${key}: ${value}`).join('\n')}\n\nMensaje:\n${lead.message || '—'}\n\nReferencia: ${ref}`;
  const html = `<h2>Nueva solicitud — Logic Estancia</h2><table>${rows.map(([key, value]) => `<tr><td><strong>${escapeHtml(key)}</strong></td><td>${escapeHtml(value)}</td></tr>`).join('')}</table><p><strong>Mensaje</strong><br>${escapeHtml(lead.message || '—')}</p><p>Referencia: ${escapeHtml(ref)}</p>`;
  return resend(configuration.apiKey, `estancia-lead/${ref}/internal`, { from: `Logic Estancia <${configuration.fromEmail}>`, to: [configuration.internalRecipient], reply_to: lead.email, subject, html, text });
}

async function sendVisitorSummary(lead: Lead, ref: string, configuration: EmailConfiguration): Promise<boolean> {
  const plan = lead.plan;
  const names = lead.lang === 'en' ? { basico: 'Basic', gestion: 'Management', inteligente: 'Intelligent' } : { basico: 'Básico', gestion: 'Gestión', inteligente: 'Inteligente' };
  const en = lead.lang === 'en';
  const subject = plan
    ? (en ? `Your Logic Estancia assessment · ${names[plan]}` : `Tu diagnóstico Logic Estancia · ${names[plan]}`)
    : (en ? 'We received your Logic Estancia request' : 'Hemos recibido tu solicitud de Logic Estancia');
  const intro = plan
    ? (en ? `Hello ${lead.name}, your initial recommendation is ${names[plan]}.` : `Hola ${lead.name}, tu recomendación inicial es ${names[plan]}.`)
    : (en ? `Hello ${lead.name}, we received your request about ${lead.businessName}.` : `Hola ${lead.name}, hemos recibido tu solicitud sobre ${lead.businessName}.`);
  const followup = en ? 'We will review your context and reply within one business day.' : 'Revisaremos tu contexto y responderemos en un día laborable.';
  const capabilities = lead.requestedCapabilities?.length
    ? `\n\n${en ? 'Requested capabilities' : 'Capacidades solicitadas'}: ${lead.requestedCapabilities.join(', ')}`
    : '';
  const capabilitiesHtml = lead.requestedCapabilities?.length
    ? `<p><strong>${en ? 'Requested capabilities' : 'Capacidades solicitadas'}</strong><br>${escapeHtml(lead.requestedCapabilities.join(', '))}</p>`
    : '';
  const text = `${intro}\n\n${followup}${capabilities}\n\n${en ? 'Reference' : 'Referencia'}: ${ref}`;
  const html = `<h2>${escapeHtml(intro)}</h2><p>${escapeHtml(followup)}</p>${capabilitiesHtml}<p>${en ? 'Reference' : 'Referencia'}: ${escapeHtml(ref)}</p>`;
  return resend(configuration.apiKey, `estancia-lead/${ref}/visitor`, { from: `Logic Estancia <${configuration.fromEmail}>`, to: [lead.email], reply_to: configuration.replyTo, subject, html, text });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } });
}
