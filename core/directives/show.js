export const applyShowDirective = (el, state, bindings) => {
  if (!(el instanceof HTMLElement)) return;

  const showExpression = el.getAttribute("i-show");
  if (!showExpression) return;

  let currentTransition = null;
  const updateShow = async () => {
    try {
      const shouldShow = new Function(
        "state",
        `with(state) { return ${showExpression} }`
      )(state);

      if (el._transitionShow && el._transitionHide) {
        if (currentTransition) {
          await currentTransition;
          currentTransition = null;
        }
        if (shouldShow) {
          currentTransition = el._transitionShow();
        } else {
          currentTransition = el._transitionHide();
        }
        await currentTransition;
      } else {
        el.style.display = shouldShow ? "" : "none";
      }
    } catch (error) {
      console.error("Error evaluating i-show directive:", error);
    }
  };

  updateShow();
  (bindings[showExpression] ??= []).push({
    element: el,
    update: updateShow,
  });
  el.removeAttribute("i-show");
};
