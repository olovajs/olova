export class PluginSystem {
  constructor(state, bindings) {
    this.state = state;
    this.bindings = bindings;
    this.customDirectives = {};
    this.plugins = [];
  }

  createPlugin(name, handler) {
    this.customDirectives[name] = handler;
  }

  addPlugin(plugin) {
    this.plugins.push(plugin);
  }

  initializePlugins() {
    this.plugins.forEach((plugin) => {
      if (typeof plugin === "function") {
        plugin({
          createPlugin: this.createPlugin.bind(this),
          state: this.state,
          bindings: this.bindings,
        });
      }
    });
  }

  applyCustomDirectives(element) {
    Array.from(element.attributes).forEach((attr) => {
      const directiveName = attr.name.startsWith("i-")
        ? attr.name.slice(1)
        : null;
      if (directiveName && this.customDirectives[directiveName]) {
        this.customDirectives[directiveName](element, attr.value, this.state);
        element.removeAttribute(attr.name);
      }
    });
  }
}
