import type { Capability } from '@logic-estancia/domain';
import type { Locale } from '@logic-estancia/config';

const DEMO_NAMES = {
  nivora: 'Nivora',
  terrava: 'Terrava',
  aurem: 'Aurem',
} as const;

export function capabilityEvidenceHref(capability: Capability, locale: Locale): string {
  const prefix = locale === 'en' ? '/en' : '';
  const base = `${prefix}/demos/${capability.evidence.demo}/`;
  if (capability.evidence.surface === 'demo-site') return `${base}#${capability.evidence.anchor}`;
  return `${base}gestion/?vista=${capability.evidence.view}`;
}

export function capabilityEvidenceLabel(capability: Capability, locale: Locale): string {
  const demo = DEMO_NAMES[capability.evidence.demo];
  return locale === 'en' ? `View evidence in ${demo}` : `Ver evidencia en ${demo}`;
}
