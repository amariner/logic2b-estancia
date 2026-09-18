// Presentation only: the existing controls remain the source of the lead payload.
function initialiseLeadPresentation(): void {
  const form = document.querySelector<HTMLFormElement>('[data-lead]');
  if (!form) return;
  const context = form.querySelector<HTMLDetailsElement>('[data-lead-context]');
  const summary = form.querySelector<HTMLElement>('[data-lead-context-summary]');
  const optional = form.querySelector<HTMLDetailsElement>('[data-lead-optional]');
  const en = document.documentElement.lang === 'en';
  const value = (name: string) => {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLSelectElement) return field.selectedOptions[0]?.textContent?.trim() ?? '';
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) return field.value;
    return '';
  };
  const count = (name: string, singular: string, plural: string) => {
    const current = value(name);
    return current ? `${current} ${current === '1' ? singular : plural}` : (en ? 'Scale to review' : 'Escala por revisar');
  };
  const refresh = () => {
    if (!summary) return;
    const parts = [
      value('accommodationType'), value('plan'),
      `${count('propertyCount', en ? 'property' : 'propiedad', en ? 'properties' : 'propiedades')} · ${count('unitCount', en ? 'unit' : 'unidad', en ? 'units' : 'unidades')}`,
      value('timeline'),
    ];
    summary.replaceChildren(...parts.map(text => {
      const item = document.createElement('span');
      item.textContent = text;
      return item;
    }));
  };
  refresh();
  // A theme can prepare a message; let the visitor see it before submitting.
  if (optional && (value('phone') || value('message'))) optional.open = true;
  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);
  context?.addEventListener('toggle', refresh);
  form.addEventListener('reset', () => queueMicrotask(refresh));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiseLeadPresentation, { once: true });
else initialiseLeadPresentation();
