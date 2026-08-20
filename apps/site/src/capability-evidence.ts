import type { Capability, CapabilityStatus } from '@logic-estancia/domain';
import type { Locale } from '@logic-estancia/config';

const DEMO_NAMES = {
  nivora: 'Nivora',
  terrava: 'Terrava',
  aurem: 'Aurem',
} as const;

const STATUS_COPY: Record<CapabilityStatus, Record<Locale, { label: string; detail: string; plan: string }>> = {
  demo_visual_disponible: {
    es: { label: 'Visible en la demo', detail: 'Representación visual ficticia; no implica activación en producción.', plan: 'Visible' },
    en: { label: 'Visible in the demo', detail: 'Fictitious visual representation; it does not imply live activation.', plan: 'Visible' },
  },
  demo_visual_pendiente: {
    es: { label: 'Demo visual pendiente', detail: 'La base existe, pero todavía no se presenta como demostrable.', plan: 'Pendiente' },
    en: { label: 'Visual demo pending', detail: 'The foundation exists but is not yet presented as demonstrable.', plan: 'Pending' },
  },
  solo_interna: {
    es: { label: 'Solo interna', detail: 'Capacidad técnica sin una superficie comercial directa.', plan: 'Interna' },
    en: { label: 'Internal only', detail: 'Technical capability without a direct commercial surface.', plan: 'Internal' },
  },
  activable_por_proyecto: {
    es: { label: 'Activable por proyecto', detail: 'Requiere validación, configuración y proveedor para cada cliente.', plan: 'Por proyecto' },
    en: { label: 'Activated per project', detail: 'Requires validation, configuration and a provider for each client.', plan: 'Per project' },
  },
  en_ruta: {
    es: { label: 'En ruta', detail: 'Todavía no está disponible ni se incluye como capacidad activa.', plan: 'En ruta' },
    en: { label: 'On the roadmap', detail: 'It is not yet available or included as an active capability.', plan: 'Roadmap' },
  },
};

export function capabilityStatusLabel(status: CapabilityStatus, locale: Locale): string {
  return STATUS_COPY[status][locale].label;
}

export function capabilityStatusDetail(status: CapabilityStatus, locale: Locale): string {
  return STATUS_COPY[status][locale].detail;
}

export function capabilityPlanStatusLabel(status: CapabilityStatus, locale: Locale): string {
  return STATUS_COPY[status][locale].plan;
}

export function capabilityEvidenceHref(capability: Capability, locale: Locale): string | null {
  if (capability.evidence.surface === 'none') return null;
  const prefix = locale === 'en' ? '/en' : '';
  const base = `${prefix}/demos/${capability.evidence.demo}/`;
  if (capability.evidence.surface === 'demo-site') return `${base}#${capability.evidence.anchor}`;
  return `${base}gestion/?vista=${capability.evidence.view}`;
}

export function capabilityEvidenceLabel(capability: Capability, locale: Locale): string {
  if (capability.evidence.surface === 'none') {
    return locale === 'en' ? 'No public visual demo' : 'Sin demo visual pública';
  }
  const demo = DEMO_NAMES[capability.evidence.demo];
  if (capability.status === 'activable_por_proyecto') {
    return locale === 'en' ? `View activation requirements in ${demo}` : `Ver requisitos de activación en ${demo}`;
  }
  return locale === 'en' ? `View visual evidence in ${demo}` : `Ver evidencia visual en ${demo}`;
}
