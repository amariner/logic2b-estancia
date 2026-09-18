// One lifecycle for both galleries: lazy preview, bounded loading and focus return.
export {};
const returnTargets = new WeakMap<HTMLDialogElement, HTMLElement>();
const loadTimers = new WeakMap<HTMLDialogElement, ReturnType<typeof setTimeout>>();
const close = (dialog: HTMLDialogElement) => { if (dialog.open) dialog.close(); };
window.addEventListener('message', event => {
  if (event.data?.type !== 'logic-estancia:close-preview') return;
  // Sandboxed previews have an opaque origin. Trust only the exact open frame.
  const dialog = document.querySelector<HTMLDialogElement>('[data-preview-dialog][open]');
  const frame = dialog?.querySelector<HTMLIFrameElement>('[data-preview-frame]');
  if (dialog && event.source === frame?.contentWindow) close(dialog);
});
document.querySelectorAll<HTMLElement>('[data-theme-preview-open], [data-home-panel-dialog-open]').forEach(trigger => {
  trigger.addEventListener('click', event => {
    if (event instanceof MouseEvent && (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    const id = trigger.dataset.themePreviewOpen ?? trigger.dataset.homePanelDialogOpen;
    const dialog = id ? document.getElementById(id) : null;
    if (!(dialog instanceof HTMLDialogElement)) return;
    if (dialog.open) return;
    returnTargets.set(dialog, trigger);
    dialog.showModal();
    event.preventDefault();
    document.documentElement.classList.add('preview-open');
    dialog.querySelector<HTMLElement>('[data-preview-close]')?.focus({ preventScroll: true });
    const frame = dialog.querySelector<HTMLIFrameElement>('[data-preview-frame]');
    const loading = dialog.querySelector<HTMLElement>('[data-preview-loading]');
    const help = dialog.querySelector<HTMLElement>('[data-preview-help]');
    if (help) help.hidden = true;
    if (frame?.dataset.previewSrc) {
      clearTimeout(loadTimers.get(dialog));
      if (loading) loading.hidden = false;
      frame.setAttribute('aria-busy', 'true');
      frame.src = frame.dataset.previewSrc;
      loadTimers.set(dialog, setTimeout(() => {
        if (!dialog.open) return;
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
    const help = dialog.querySelector<HTMLElement>('[data-preview-help]');
    if (loading) loading.hidden = true;
    if (help) help.hidden = true;
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
    dialog.querySelectorAll<HTMLDetailsElement>('[data-preview-details]').forEach(details => { details.open = false; });
    dialog.querySelectorAll<HTMLElement>('[data-preview-loading], [data-preview-help]').forEach(element => { element.hidden = true; });
    delete dialog.dataset.device;
    dialog.querySelectorAll<HTMLElement>('[data-preview-device]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.previewDevice === 'desktop')));
    if (!document.querySelector('[data-preview-dialog][open]')) document.documentElement.classList.remove('preview-open');
    const returnTarget = returnTargets.get(dialog);
    if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true });
  });
});
