export const initBindDirective = (container, state, bindings) => {
  container.querySelectorAll("*").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;

    Array.from(el.attributes).forEach((attr) => {
      const bindMatch = attr.name.match(/^(?:i-bind:|:)(.+)$/);
      if (!bindMatch) return;

      const [, attrName] = bindMatch;
      const bindExpression = attr.value;

      const updateBind = () => {
        try {
          let value = new Function(
            "state",
            `with(state) { return ${bindExpression} }`
          )(state);

          if (attrName === "class") {
            if (typeof value === "object" && value !== null) {
              Object.entries(value).forEach(([className, condition]) => {
                el.classList.toggle(className, !!condition);
              });
            } else {
              el.className = value;
            }
          } else if (attrName === "style") {
            if (typeof value === "object" && value !== null) {
              Object.entries(value).forEach(([prop, val]) => {
                el.style[prop] = val;
              });
            } else {
              el.setAttribute("style", value);
            }
          } else {
            if (value === false) {
              el.removeAttribute(attrName);
            } else {
              el.setAttribute(attrName, value === true ? "" : value);
            }
          }
        } catch (error) {
          console.error(
            `Error applying bind directive for ${attrName}:`,
            error
          );
        }
      };

      updateBind();
      (bindings[bindExpression] ??= []).push({ update: updateBind });
      el.removeAttribute(attr.name);
    });
  });
};
