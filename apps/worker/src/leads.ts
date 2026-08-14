import { z } from 'zod';

export interface LeadEnv {
  LEADS_TRANSPORT?: 'resend' | 'disabled' | 'demo';
  LEADS_RESEND_API_KEY?: string;
}

export const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  businessName: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(60).optional(),
  accommodationType: z.enum(['apartment', 'rural', 'hotel']),
  propertyCount: z.number().int().min(1).max(10_000),
  unitCount: z.number().int().min(1).max(100_000),
  plan: z.enum(['inicio', 'gestion', 'automatiza', 'inteligente']).or(z.literal('')).optional(),
  message: z.string().trim().max(2_000).optional(),
  lang: z.enum(['es', 'en']).optional(),
  accept: z.literal(true),
  website: z.string().trim().max(200).optional(),
});

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
  if (transport === 'disabled' || (transport === 'resend' && !env.LEADS_RESEND_API_KEY)) {
    return json({ ok: false, outcome: 'disabled', error: 'lead_delivery_disabled' }, 503);
  }
  if (transport === 'demo') return json({ ok: true, outcome: 'demo' }, 202);

  const ref = crypto.randomUUID();
  const rows: [string, string][] = [
    ['Alojamiento', lead.businessName], ['Nombre', lead.name], ['Email', lead.email],
    ['Teléfono', lead.phone || '—'], ['Tipo', lead.accommodationType],
    ['Propiedades', String(lead.propertyCount)], ['Unidades', String(lead.unitCount)],
    ['Plan', lead.plan || '—'], ['Idioma', lead.lang || '—'],
    ['Consentimiento', 'Aceptó la política de privacidad'],
  ];
  const subject = `${lead.plan ? `Plan ${lead.plan}` : 'Proyecto'} · ${lead.businessName}`;
  const text = `Nueva solicitud — Logic Estancia\n\n${rows.map(([key, value]) => `${key}: ${value}`).join('\n')}\n\nMensaje:\n${lead.message || '—'}`;
  const html = `<h2>Nueva solicitud — Logic Estancia</h2><table>${rows.map(([key, value]) => `<tr><td><strong>${escapeHtml(key)}</strong></td><td>${escapeHtml(value)}</td></tr>`).join('')}</table><p><strong>Mensaje</strong><br>${escapeHtml(lead.message || '—')}</p>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.LEADS_RESEND_API_KEY}`, 'content-type': 'application/json', 'idempotency-key': `estancia-lead/${ref}` },
    body: JSON.stringify({
      from: 'Logic Estancia <leads@logic2b.com>',
      to: ['marinerandreu@gmail.com'],
      reply_to: lead.email,
      subject,
      html,
      text,
    }),
  });
  if (!response.ok) {
    console.error(JSON.stringify({ event: 'lead_send_failed', ref, status: response.status }));
    return json({ ok: false, outcome: 'failed', error: 'lead_delivery_failed', ref }, 502);
  }
  return json({ ok: true, outcome: 'delivered' }, 202);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } });
}
