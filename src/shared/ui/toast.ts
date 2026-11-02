export function createToast(toast: HTMLElement) {
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  function showToast(message: string): void {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
  }
  return { show: showToast };
}
