export const initRefDirective = (container, $refs) => {
  container.querySelectorAll("[\\i-ref]").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const refName = el.getAttribute("i-ref");
    if (!refName) return;
    $refs[refName] = el;
    el.removeAttribute("i-ref");
  });
};
