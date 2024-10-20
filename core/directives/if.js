export const applyIfDirective = (el, state, bindings) => {
  if (!(el instanceof HTMLElement)) return;
  const ifExpression = el.getAttribute("i-if");
  if (!ifExpression) return;

  const elseEl = el.nextElementSibling?.hasAttribute("i-else")
    ? el.nextElementSibling
    : null;
  const parent = el.parentNode;
  const comment = document.createComment("i-if placeholder");
  parent?.insertBefore(comment, el);

  const updateIf = () => {
    try {
      const shouldRender = new Function(
        "state",
        `with(state) { return ${ifExpression} }`
      )(state);

      if (shouldRender) {
        if (!el.isConnected) parent?.insertBefore(el, comment.nextSibling);
        if (elseEl?.isConnected) parent?.removeChild(elseEl);
      } else {
        if (el.isConnected) parent?.removeChild(el);
        if (elseEl && !elseEl.isConnected)
          parent?.insertBefore(elseEl, comment.nextSibling);
      }
    } catch (error) {
      console.error("Error evaluating i-if directive:", error);
    }
  };

  updateIf();
  (bindings[ifExpression] ??= []).push({ element: el, update: updateIf });

  el.removeAttribute("i-if");
  elseEl?.removeAttribute("i-else");
};
