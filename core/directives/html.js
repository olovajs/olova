export const initHtmlDirective = (container, state, bindings) => {
  container.querySelectorAll("[\\i-html]").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const htmlBinding = el.getAttribute("i-html");
    if (!htmlBinding) return;

    const updateHtml = () => {
      try {
        let htmlContent = new Function(
          "state",
          `with(state) { return ${htmlBinding} }`
        )(state);

        htmlContent = htmlContent.replace(/\{(.*?)\}/g, (_, exp) => {
          return new Function("state", `with(state) { return ${exp} }`)(state);
        });

        el.innerHTML = htmlContent;

        el.querySelectorAll("*").forEach((nestedEl) => {
          if (nestedEl instanceof HTMLElement) {
            processElement(nestedEl);
          }
        });
      } catch (error) {
        console.error("Error applying i-html directive:", error);
      }
    };

    const processElement = (element) => {
      Array.from(element.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          processTextNode(node);
        }
      });

      Array.from(element.attributes).forEach((attr) => {
        if (attr.value.includes("{") && attr.value.includes("}")) {
          processAttribute(element, attr);
        }
      });
    };

    const processTextNode = (node) => {
      const originalText = node.textContent || "";
      if (originalText.includes("{") && originalText.includes("}")) {
        const parts = originalText.split(/(\{.*?\})/);
        const fragment = document.createDocumentFragment();

        parts.forEach((part) => {
          if (part.startsWith("{") && part.endsWith("}")) {
            const expression = part.slice(1, -1).trim();
            const expressionNode = document.createTextNode("");
            fragment.appendChild(expressionNode);

            const updateExpression = () => {
              try {
                const result = new Function(
                  "state",
                  `with(state) { return ${expression} }`
                )(state);
                expressionNode.textContent = result;
              } catch (error) {
                console.error(
                  `Error evaluating expression: ${expression}`,
                  error
                );
                expressionNode.textContent = "";
              }
            };

            updateExpression();
            Object.keys(state).forEach((key) => {
              (bindings[key] ??= []).push({
                update: updateExpression,
              });
            });
          } else {
            fragment.appendChild(document.createTextNode(part));
          }
        });

        node.parentNode.replaceChild(fragment, node);
      }
    };

    const processAttribute = (element, attr) => {
      const originalValue = attr.value;
      const updateAttribute = () => {
        const newValue = originalValue.replace(/\{(.*?)\}/g, (_, exp) => {
          return new Function("state", `with(state) { return ${exp} }`)(state);
        });
        element.setAttribute(attr.name, newValue);
      };

      updateAttribute();
      Object.keys(state).forEach((key) => {
        (bindings[key] ??= []).push({
          update: updateAttribute,
        });
      });
    };

    updateHtml();
    Object.keys(state).forEach((key) => {
      (bindings[key] ??= []).push({ update: updateHtml });
    });
    el.removeAttribute("i-html");
  });
};
