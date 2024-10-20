class ComponentSystem {
  constructor() {
    this.componentsRegistry = new Map();
  }

  register(name, componentFunction) {
    this.componentsRegistry.set(name, componentFunction);
  }

  render(name, props) {
    const componentFunction = this.componentsRegistry.get(name);
    if (!componentFunction) {
      console.error(`Component "${name}" not found`);
      return "";
    }
    return componentFunction(props);
  }

  processCustomElements(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const componentName = node.tagName.toLowerCase();
      if (this.componentsRegistry.has(componentName)) {
        const componentFunction = this.componentsRegistry.get(componentName);
        const props = Array.from(node.attributes).reduce(
          (acc, attr) => ({ ...acc, [attr.name]: attr.value }),
          {}
        );
        const renderedComponent = componentFunction(props);
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = renderedComponent;
        const newNode = tempContainer.firstElementChild;
        if (newNode) {
          node.parentNode?.replaceChild(newNode, node);
          return newNode;
        }
      }
    }
    return node;
  }
}

export { ComponentSystem };
