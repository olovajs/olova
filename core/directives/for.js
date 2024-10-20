export const applyForDirective = (el, state, bindings) => {
  if (!(el instanceof HTMLElement)) return;
  const forExpression = el.getAttribute("i-for");
  if (!forExpression) return;

  const match = forExpression.match(/(\w+)(?:,\s*(\w+))?\s+(?:in|of)\s+(.+)/);
  if (!match) {
    console.error("Invalid i-for expression:", forExpression);
    return;
  }

  const [, itemName, indexName, collectionName] = match;
  const keyAttribute = el.getAttribute("i-key") || null;
  const parent = el.parentNode;
  const comment = document.createComment(`i-for: ${forExpression}`);
  parent?.insertBefore(comment, el);

  const itemTemplate = el.cloneNode(true);
  itemTemplate.removeAttribute("i-for");
  itemTemplate.removeAttribute("i-key");

  const updateFor = () => {
    try {
      const collection = new Function(
        "state",
        `with(state) { return ${collectionName} }`
      )(state);

      const fragment = document.createDocumentFragment();
      const existingElements = new Map();

      let currentNode = comment.nextSibling;
      while (
        currentNode &&
        currentNode.hasAttribute &&
        currentNode.hasAttribute("data-i-for-id")
      ) {
        existingElements.set(
          currentNode.getAttribute("data-i-for-id"),
          currentNode
        );
        currentNode = currentNode.nextSibling;
      }

      collection.forEach((item, index) => {
        const key = keyAttribute ? item[keyAttribute] : JSON.stringify(item);
        const forId = `${collectionName}-${key}`;
        let el = existingElements.get(forId);

        if (!el) {
          el = itemTemplate.cloneNode(true);
          el.setAttribute("data-i-for-id", forId);
        } else {
          existingElements.delete(forId);
        }

        const itemState = {
          ...state,
          [itemName]: item,
          ...(indexName ? { [indexName]: index } : { index }),
        };
        updateElement(el, itemState);

        fragment.appendChild(el);
      });

      existingElements.forEach((el) => el.remove());

      while (
        comment.nextSibling &&
        comment.nextSibling.hasAttribute &&
        comment.nextSibling.hasAttribute("data-i-for-id")
      ) {
        parent.removeChild(comment.nextSibling);
      }

      parent.insertBefore(fragment, comment.nextSibling);
    } catch (error) {
      console.error("Error evaluating i-for directive:", error);
    }
  };

  const updateElement = (el, itemState) => {
    el.querySelectorAll("*").forEach((child) => {
      Array.from(child.attributes).forEach((attr) => {
        if (attr.value.includes("{") && attr.value.includes("}")) {
          const newValue = attr.value.replace(/\{(.*?)\}/g, (_, exp) => {
            return new Function("state", `with(state) { return ${exp} }`)(
              itemState
            );
          });
          child.setAttribute(attr.name, newValue);
        }
      });
    });

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
                )(itemState);
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
          } else {
            fragment.appendChild(document.createTextNode(part));
          }
        });

        node.parentNode.replaceChild(fragment, node);
      }
    };

    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        processTextNode(node);
      }
    });
  };

  updateFor();
  (bindings[collectionName] ??= []).push({ update: updateFor });

  el.remove();
};
