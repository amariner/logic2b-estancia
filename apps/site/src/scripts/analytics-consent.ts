import { CONSENT } from '@logic-estancia/config';

export interface AnalyticsConsent {
  essential: true;
  analytics: boolean;
  timestamp: string;
  version: string;
}

const isConsent = (value: unknown): value is AnalyticsConsent => {
  if (!value || typeof value !== 'object') return false;
  const consent = value as Partial<AnalyticsConsent>;
  return consent.version === CONSENT.version
    && consent.essential === true
    && typeof consent.analytics === 'boolean'
    && typeof consent.timestamp === 'string';
};

function persist(consent: AnalyticsConsent): void {
  try {
    localStorage.setItem(CONSENT.key, JSON.stringify(consent));
    localStorage.removeItem(CONSENT.legacyKey);
  } catch {
    // La elección sigue siendo válida durante esta navegación aunque el
    // navegador no permita conservarla.
  }
}

export function getConsent(): AnalyticsConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT.key);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isConsent(parsed)) return parsed;
    }

    const legacy = localStorage.getItem(CONSENT.legacyKey);
    if (legacy !== 'analytics' && legacy !== 'essential') return null;
    const migrated: AnalyticsConsent = {
      essential: true,
      analytics: legacy === 'analytics',
      timestamp: new Date().toISOString(),
      version: CONSENT.version,
    };
    persist(migrated);
    return migrated;
  } catch {
    return null;
  }
}

export function setConsent(analytics: boolean): AnalyticsConsent {
  const consent: AnalyticsConsent = {
    essential: true,
    analytics,
    timestamp: new Date().toISOString(),
    version: CONSENT.version,
  };
  persist(consent);
  if (analytics) window.estanciaLoadGtm?.();
  window.dispatchEvent(new CustomEvent('estancia:consent-updated', { detail: consent }));
  return consent;
}

export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT.key);
    localStorage.removeItem(CONSENT.legacyKey);
  } catch {
    // El panel se vuelve a abrir aunque el almacenamiento esté bloqueado.
  }
  clearAnalyticsCookies();
  window.dispatchEvent(new CustomEvent('estancia:consent-cleared'));
}

function clearAnalyticsCookies(): void {
  const names = document.cookie
    .split(';')
    .map((part) => part.split('=', 1)[0]?.trim())
    .filter((name): name is string => Boolean(name))
    .filter((name) => name === '_gid' || name === '_gat' || name.startsWith('_ga'));
  const domains = ['', location.hostname, '.logic2b.com'];
  for (const name of names) {
    for (const domain of domains) {
      const suffix = domain ? `;domain=${domain}` : '';
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${suffix};SameSite=Lax`;
    }
  }
}

declare global {
  interface Window {
    estanciaLoadGtm?: () => void;
    estanciaTrack?: (event: string, parameters?: Record<string, string | number | undefined>) => void;
    dataLayer?: Record<string, unknown>[];
  }
}
