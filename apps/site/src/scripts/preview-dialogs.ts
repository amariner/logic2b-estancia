// One lifecycle for both galleries: lazy preview, bounded loading and focus return.
export {};
const returnTargets = new WeakMap<HTMLDialogElement, HTMLElement>();
const loadTimers = new WeakMap<HTMLDialogElement, ReturnType<typeof setTimeout>>();
const close = (dialog: HTMLDialogElement) => dialog.close();
document.querySelectorAll<HTMLElement>('[data-theme-preview-open], [data-home-panel-dialog-open]').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const id = trigger.dataset.themePreviewOpen ?? trigger.dataset.homePanelDialogOpen;
    const dialog = id ? document.getElementById(id) : null;
    if (!(dialog instanceof HTMLDialogElement)) return;
    returnTargets.set(dialog, trigger);
    dialog.showModal();
    document.documentElement.classList.add('preview-open');
    dialog.querySelector<HTMLElement>('[data-preview-close]')?.focus({ preventScroll: true });
    const frame = dialog.querySelector<HTMLIFrameElement>('[data-preview-frame]');
    const loading = dialog.querySelector<HTMLElement>('[data-preview-loading]');
    const help = dialog.querySelector<HTMLElement>('[data-preview-help]');
    if (help) help.hidden = true;
    if (frame?.dataset.previewSrc) {
      if (loading) loading.hidden = false;
      frame.setAttribute('aria-busy', 'true');
      frame.src = frame.dataset.previewSrc;
      loadTimers.set(dialog, setTimeout(() => {
        if (loading) loading.hidden = true;
        if (help) help.hidden = false;
        frame.setAttribute('aria-busy', 'false');
      }, 12_000));
    }
  });
});
document.querySelectorAll<HTMLDialogElement>('[data-preview-dialog]').forEach(dialog => {
  dialog.querySelector('[data-preview-close]')?.addEventListener('click', () => close(dialog));
  dialog.addEventListener('click', event => { if (event.target === dialog) close(dialog); });
  const frame = dialog.querySelector<HTMLIFrameElement>('[data-preview-frame]');
  frame?.addEventListener('load', () => {
    if (frame.getAttribute('src') === 'about:blank') return;
    clearTimeout(loadTimers.get(dialog));
    const loading = dialog.querySelector<HTMLElement>('[data-preview-loading]');
    if (loading) loading.hidden = true;
    frame.setAttribute('aria-busy', 'false');
  });
  dialog.querySelectorAll<HTMLButtonElement>('[data-preview-device]').forEach(button => {
    button.addEventListener('click', () => {
      dialog.dataset.device = button.dataset.previewDevice;
      dialog.querySelectorAll('[data-preview-device]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
    });
  });
  dialog.addEventListener('close', () => {
    clearTimeout(loadTimers.get(dialog));
    if (frame) frame.src = 'about:blank';
    delete dialog.dataset.device;
    dialog.querySelectorAll<HTMLElement>('[data-preview-device]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.previewDevice === 'desktop')));
    if (!document.querySelector('[data-preview-dialog][open]')) document.documentElement.classList.remove('preview-open');
    returnTargets.get(dialog)?.focus({ preventScroll: true });
  });
});
