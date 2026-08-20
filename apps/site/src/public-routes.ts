const sharedRoutes = ['/', '/docs/', '/legal/', '/privacidad/', '/cookies/'] as const;

export const INDEXABLE_PATHS = [
  ...sharedRoutes.flatMap((route) => [route, `/en${route}`]),
  '/soluciones/casas-rurales/', '/en/solutions/rural-stays/',
  '/soluciones/apartamentos/', '/en/solutions/apartments/',
  '/soluciones/hoteles/', '/en/solutions/hotels/',
  '/planes/', '/en/plans/', '/diagnostico/', '/en/assessment/',
  '/recursos/gestor-reservas-apartamentos-turisticos/',
  '/recursos/web-hotel-reservas-directas-operacion/',
] as const;

export const ANALYTICS_SAFE_PATHS = [
  ...INDEXABLE_PATHS,
  '/soluciones/gestores/',
  '/en/solutions/managers/',
] as const;
