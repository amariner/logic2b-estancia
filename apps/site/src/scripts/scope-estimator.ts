import { recommendLevel, type PlanLevel, type ScopeSignals } from '@logic-estancia/domain';

type ScopeCopy = {
  plans: Record<PlanLevel, readonly [string, string]>;
  reasons: Record<'single' | 'multi' | 'booking' | 'automation' | 'operations' | 'scale', string>;
};

const levelCodes: Record<PlanLevel, string> = { inicio: '00', gestion: '01', automatiza: '02', inteligente: '03' };

function positiveInteger(input: HTMLInputElement): number {
  return Math.max(1, Math.trunc(Number(input.value) || 1));
}

document.querySelectorAll<HTMLElement>('[data-scope-estimator]').forEach((estimator) => {
  const controls = estimator.querySelector<HTMLFormElement>('[data-scope-controls]');
  const properties = controls?.elements.namedItem('scopeProperties') as HTMLInputElement | null;
  const units = controls?.elements.namedItem('scopeUnits') as HTMLInputElement | null;
  const bookings = controls?.elements.namedItem('scopeBookings') as HTMLInputElement | null;
  const automation = controls?.elements.namedItem('scopeAutomation') as HTMLInputElement | null;
  const operations = controls?.elements.namedItem('scopeOperations') as HTMLInputElement | null;
  const name = estimator.querySelector<HTMLElement>('[data-scope-name]');
  const code = estimator.querySelector<HTMLElement>('[data-scope-code]');
  const description = estimator.querySelector<HTMLElement>('[data-scope-description]');
  const reasons = estimator.querySelector<HTMLUListElement>('[data-scope-reasons]');
  const apply = estimator.querySelector<HTMLAnchorElement>('[data-use-scope]');
  if (!controls || !properties || !units || !bookings || !automation || !operations || !name || !code || !description || !reasons || !apply) return;

  const copy = JSON.parse(estimator.dataset.copy ?? '{}') as ScopeCopy;
  let currentLevel: PlanLevel = 'inicio';

  const currentSignals = (): ScopeSignals => ({
    propertyCount: positiveInteger(properties),
    unitCount: positiveInteger(units),
    wantsBookings: bookings.checked,
    wantsAutomation: automation.checked,
    wantsOperations: operations.checked,
  });

  const render = () => {
    const signals = currentSignals();
    currentLevel = recommendLevel(signals);
    const plan = copy.plans[currentLevel];
    code.textContent = levelCodes[currentLevel];
    name.textContent = plan[0];
    description.textContent = plan[1];
    estimator.dataset.level = currentLevel;

    const reasonKeys: (keyof ScopeCopy['reasons'])[] = [];
    if (signals.propertyCount > 1 || signals.unitCount > 1) reasonKeys.push('multi');
    if (signals.wantsBookings) reasonKeys.push('booking');
    if (signals.wantsAutomation) reasonKeys.push('automation');
    if (signals.wantsOperations) reasonKeys.push('operations');
    if (signals.unitCount >= 12) reasonKeys.push('scale');
    if (reasonKeys.length === 0) reasonKeys.push('single');
    reasons.replaceChildren(...reasonKeys.map((key) => {
      const item = document.createElement('li');
      item.textContent = copy.reasons[key];
      return item;
    }));
  };

  controls.addEventListener('input', render);
  controls.addEventListener('change', render);
  apply.addEventListener('click', () => {
    const lead = document.querySelector<HTMLFormElement>('[data-lead]');
    const plan = lead?.elements.namedItem('plan') as HTMLSelectElement | null;
    const propertyCount = lead?.elements.namedItem('propertyCount') as HTMLInputElement | null;
    const unitCount = lead?.elements.namedItem('unitCount') as HTMLInputElement | null;
    if (plan) plan.value = currentLevel;
    if (propertyCount) propertyCount.value = String(positiveInteger(properties));
    if (unitCount) unitCount.value = String(positiveInteger(units));
    const analyticsWindow = window as Window & { dataLayer?: Record<string, unknown>[] };
    analyticsWindow.dataLayer?.push({ event: 'estancia_scope_recommendation', plan: currentLevel, properties: positiveInteger(properties), units: positiveInteger(units) });
  });
  render();
});
