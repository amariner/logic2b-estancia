import type { Locale } from '@logic-estancia/config';
import { getBusinesses } from './businesses';
import { getHomeContract } from './home-contract';

export interface SiteShellLink {
  label: string;
  href: string;
}

export interface SiteShellContract {
  product: readonly SiteShellLink[];
  journey: SiteShellLink;
  contact: SiteShellLink;
  assessment: SiteShellLink;
  guides: SiteShellLink;
  solutions: readonly SiteShellLink[];
  footerProduct: readonly SiteShellLink[];
  legal: readonly SiteShellLink[];
}

export function getSiteShell(locale: Locale, isHome: boolean): SiteShellContract {
  const en = locale === 'en';
  const prefix = en ? '/en' : '';
  const home = getHomeContract(locale);
  const navigation = home.navigation.map((item) => ({
    ...item,
    href: item.href.startsWith('#')
      ? (isHome ? item.href : `${prefix}/${item.href}`)
      : `${prefix}${item.href}`,
  }));
  const journey = navigation.find(({ key }) => key === 'recorrido');
  if (!journey) throw new Error(`missing_shell_journey:${locale}`);

  return {
    product: navigation
      .filter(({ key }) => key !== 'recorrido')
      .map(({ label, href }) => ({ label, href })),
    journey: { label: journey.label, href: journey.href },
    contact: {
      label: en ? 'Contact us' : 'Contactar',
      href: `${prefix}/#contacto`,
    },
    assessment: {
      label: en ? 'Find your starting point' : 'Ver mi punto de partida',
      href: `${prefix}/${en ? 'assessment' : 'diagnostico'}/`,
    },
    guides: {
      label: en ? 'Guides' : 'Guías',
      href: `${prefix}/docs/`,
    },
    solutions: getBusinesses(locale).map(({ label, href }) => ({ label, href })),
    footerProduct: [
      { label: en ? 'Websites' : 'Webs', href: `${prefix}/webs/` },
      { label: en ? 'Workspace' : 'Gestor', href: `${prefix}/${en ? 'panels' : 'paneles'}/` },
      { label: en ? 'Plans' : 'Planes', href: `${prefix}/${en ? 'plans' : 'planes'}/` },
      { label: journey.label, href: journey.href },
    ],
    legal: [
      { label: 'Legal', href: `${prefix}/legal/` },
      { label: en ? 'Privacy' : 'Privacidad', href: `${prefix}/privacidad/` },
      { label: 'Cookies', href: `${prefix}/cookies/` },
    ],
  };
}
