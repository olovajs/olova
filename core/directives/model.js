export const initModelDirective = (
  container,
  state,
  bindings,
  triggerUpdate
) => {
  const modelListeners = new WeakMap();
  const radioGroups = {};

  const getModelValue = (el) => {
    if (el instanceof HTMLInputElement) {
      if (el.type === "checkbox") {
        return el.checked;
      } else if (el.type === "radio") {
        return el.checked ? el.value : undefined;
      } else {
        return el.value;
      }
    } else if (el instanceof HTMLSelectElement) {
      return el.multiple
        ? Array.from(el.selectedOptions).map((option) => option.value)
        : el.value;
    } else if (el instanceof HTMLTextAreaElement) {
      return el.value;
    }
  };

  const setModelValue = (el, value) => {
    if (el instanceof HTMLInputElement) {
      if (el.type === "checkbox") {
        el.checked = !!value;
      } else if (el.type === "radio") {
        el.checked = el.value === value;
      } else {
        el.value = value;
      }
    } else if (el instanceof HTMLSelectElement) {
      if (el.multiple) {
        Array.from(el.options).forEach((option) => {
          option.selected = value.includes(option.value);
        });
      } else {
        el.value = value;
      }
    } else if (el instanceof HTMLTextAreaElement) {
      el.value = value;
    }
  };

  container.querySelectorAll("[\\i-model]").forEach((el) => {
    const modelExpression = el.getAttribute("i-model");
    if (!modelExpression) return;

    const updateModel = () => {
      const value = getModelValue(el);
      if (value !== undefined) {
        state[modelExpression] = value;
        triggerUpdate(modelExpression);
      }
    };

    const updateElement = () => {
      setModelValue(el, state[modelExpression]);
    };

    if (modelListeners.has(el)) {
      const oldListeners = modelListeners.get(el);
      oldListeners.forEach(([event, listener]) => {
        el.removeEventListener(event, listener);
      });
    }

    const newListeners = [];
    if (
      el instanceof HTMLSelectElement ||
      el.type === "checkbox" ||
      el.type === "radio"
    ) {
      const listener = () => updateModel();
      el.addEventListener("change", listener);
      newListeners.push(["change", listener]);
    } else {
      const listener = () => updateModel();
      el.addEventListener("input", listener);
      newListeners.push(["input", listener]);
    }
    modelListeners.set(el, newListeners);

    if (el instanceof HTMLInputElement && el.type === "radio") {
      if (!radioGroups[modelExpression]) {
        radioGroups[modelExpression] = [];
      }
      radioGroups[modelExpression].push(el);
      el.name = `radio-group-${modelExpression}`;
    }

    (bindings[modelExpression] ??= []).push({
      element: el,
      updateModel: updateElement,
    });

    updateElement();
    el.removeAttribute("i-model");
  });

  Object.entries(radioGroups).forEach(([modelExpression, radios]) => {
    (bindings[modelExpression] ??= []).push({
      updateModel: () => {
        radios.forEach((radio) => {
          radio.checked = radio.value === state[modelExpression];
        });
      },
    });
  });
};
