// 🚀 Buckle up! We're about to embark on a routing-free adventure!
// No need for fancy navigation here - we're keeping it old school and awesome! 😎
//without routing

// import { reactive } from "./reactivity/reactivity.js";
// import { createLifecycleHooks } from "./hooks/lifecycle.js";
// import {
//   applyIfDirective,
//   applyForDirective,
//   applyShowDirective,
//   initModelDirective,
//   initHtmlDirective,
//   initBindDirective,
//   initTransitionDirective,
//   initRefDirective,
// } from "./directives/directives.js";
// import { PluginSystem } from "./plugin/plugins.js";
// import { ComponentSystem } from "./component/componentSystem.js";
// import {
//   TemplateError,
//   StateError,
//   errorHandler,
//   globalErrorHandler,
// } from "./error/errorHandling.js";

// const createApp = ({
//   data,
//   computed,
//   methods,
//   watch,
//   mounted,
//   beforeMount,
//   beforeUpdate,
//   template,
//   plugins = [],
//   components = {},
//   mixins = [],
//   directives = {},
// }) => {
//   let container;
//   const bindings = {};
//   const computedCache = {};
//   const watchHandlers = {};
//   const $refs = {};
//   const eventBus = new Map();

//   const componentSystem = new ComponentSystem();
//   const { addHook, runHooks } = createLifecycleHooks();

//   const component = (name, componentFunction) => {
//     componentSystem.register(name, componentFunction);
//   };

//   const renderComponent = (name, props) => {
//     return componentSystem.render(name, props);
//   };

//   const triggerUpdate = (key) => {
//     if (beforeUpdate)
//       errorHandler(beforeUpdate, "Error in beforeUpdate hook").call(state, key);
//     updateBindings(key);
//     invalidateComputedCache();
//     triggerWatchers(key);
//     watchHandlers["__updated__"]?.forEach((handler) =>
//       handler.callback.call(state)
//     );
//   };

//   const state = reactive(
//     {
//       ...data,
//       $refs: new Proxy($refs, {
//         get: (target, key) => {
//           const el = target[key];
//           if (el instanceof HTMLElement) {
//             return new Proxy(el, {
//               get: (target, prop) => {
//                 if (typeof target[prop] === "function") {
//                   return target[prop].bind(target);
//                 }
//                 return target[prop];
//               },
//             });
//           }
//           return el;
//         },
//         set: () => {
//           throw new Error("$refs is read-only");
//         },
//       }),
//     },
//     triggerUpdate
//   );

//   const pluginSystem = new PluginSystem(state, bindings);

//   Object.entries(directives).forEach(([name, handler]) => {
//     pluginSystem.createPlugin(name, handler);
//   });

//   plugins.forEach((plugin) => pluginSystem.addPlugin(plugin));

//   if (beforeMount)
//     errorHandler(beforeMount, "Error in beforeMount hook", StateError).call(
//       state
//     );

//   const pendingUpdates = new Set();

//   const updateBindings = (key) => {
//     if (bindings[key]) {
//       pendingUpdates.add(key);
//       requestAnimationFrame(() => {
//         pendingUpdates.forEach((bindingKey) => {
//           bindings[bindingKey].forEach(
//             errorHandler((binding) => {
//               if (binding.node) {
//                 binding.node.textContent = binding.originalText.replace(
//                   /\{(.*?)\}/g,
//                   (_, expression) => {
//                     try {
//                       return new Function(
//                         "state",
//                         `with(state) { return ${expression} }`
//                       )(state);
//                     } catch (error) {
//                       console.error(
//                         `Error evaluating expression: ${expression}`,
//                         error
//                       );
//                       return "";
//                     }
//                   }
//                 );
//               } else if (binding.element && binding.attrName) {
//                 binding.element.setAttribute(
//                   binding.attrName,
//                   state[bindingKey]
//                 );
//                 binding.element.removeAttribute(`:${binding.attrName}`);
//               } else if (binding.update) {
//                 binding.update();
//               }
//             }, "Error updating bindings")
//           );
//         });
//         pendingUpdates.clear();
//       });
//     }
//   };

//   const onUpdated = (callback) => {
//     if (typeof callback === "function") {
//       const wrappedCallback = errorHandler(
//         callback,
//         "Error in onUpdated callback"
//       );
//       (watchHandlers["__updated__"] ??= []).push({ callback: wrappedCallback });
//     }
//   };

//   const invalidateComputedCache = () => {
//     Object.keys(computedCache).forEach((key) => delete computedCache[key]);
//   };

//   const triggerWatchers = (key) => {
//     if (watchHandlers[key]) {
//       watchHandlers[key].forEach((handler) => {
//         if (handler.debounce) {
//           clearTimeout(handler.timeout);
//           handler.timeout = setTimeout(
//             () => handler.callback.call(state, state[key]),
//             handler.debounce
//           );
//         } else if (handler.throttle) {
//           if (
//             !handler.lastCalled ||
//             Date.now() - handler.lastCalled > handler.throttle
//           ) {
//             handler.callback.call(state, state[key]);
//             handler.lastCalled = Date.now();
//           }
//         } else {
//           handler.callback.call(state, state[key]);
//         }
//       });
//     }
//   };

//   if (watch) {
//     Object.entries(watch).forEach(([key, value]) => {
//       watchHandlers[key] = Array.isArray(value)
//         ? value.map((handler) => ({ callback: handler }))
//         : [typeof value === "function" ? { callback: value } : { ...value }];
//     });
//   }

//   const computedDependencies = {};
//   const pendingPromises = {};

//   if (computed) {
//     Object.entries(computed).forEach(([key, originalComputed]) => {
//       computedDependencies[key] = [];

//       Object.defineProperty(state, key, {
//         get: () => {
//           if (
//             typeof originalComputed === "function" &&
//             originalComputed.constructor.name === "AsyncFunction"
//           ) {
//             if (pendingPromises[key]) return pendingPromises[key];

//             computedCache[key] = new Proxy(state, {
//               get: (target, dependencyKey) => {
//                 if (!computedDependencies[key].includes(dependencyKey)) {
//                   computedDependencies[key].push(dependencyKey);
//                 }
//                 return target[dependencyKey];
//               },
//             });

//             pendingPromises[key] = originalComputed
//               .call(state)
//               .then((result) => {
//                 computedCache[key] = result;
//                 delete pendingPromises[key];
//                 updateBindings(key);
//                 return result;
//               })
//               .catch((err) => {
//                 console.error(
//                   `Error in async computed property "${key}":`,
//                   err
//                 );
//               });

//             return pendingPromises[key];
//           }

//           if (!computedCache.hasOwnProperty(key)) {
//             computedCache[key] = new Proxy(state, {
//               get: (target, dependencyKey) => {
//                 if (!computedDependencies[key].includes(dependencyKey)) {
//                   computedDependencies[key].push(dependencyKey);
//                 }
//                 return target[dependencyKey];
//               },
//             });

//             computedCache[key] = originalComputed.call(state);
//           }

//           return computedCache[key];
//         },
//         enumerable: true,
//       });
//     });
//   }

//   const triggerComputedUpdate = (changedKey) => {
//     Object.entries(computedDependencies).forEach(
//       ([computedKey, dependencies]) => {
//         if (dependencies.includes(changedKey)) {
//           delete computedCache[computedKey];
//           updateBindings(computedKey);
//         }
//       }
//     );
//   };

//   const processCustomElements = (node) => {
//     return componentSystem.processCustomElements(node);
//   };

//   const processTemplate = () => {
//     const templateContent =
//       typeof template === "string"
//         ? template.trim()
//         : template instanceof HTMLElement
//         ? template.innerHTML
//         : container.innerHTML.trim();

//     if (!templateContent) {
//       throw new Error("No template provided and container is empty");
//     }

//     const templateElement = document.createElement("template");
//     templateElement.innerHTML = templateContent;
//     container.innerHTML = "";
//     container.appendChild(templateElement.content.cloneNode(true));

//     const processNode = (node) => {
//       if (node.nodeType === Node.ELEMENT_NODE) {
//         node = processCustomElements(node);
//         if (node instanceof HTMLElement) {
//           if (node.hasAttribute("i-if")) {
//             applyIfDirective(node, state, bindings);
//           }
//           if (node.hasAttribute("i-for")) {
//             applyForDirective(node, state, bindings);
//           }
//           if (node.hasAttribute("i-show")) {
//             applyShowDirective(node, state, bindings);
//           }
//           pluginSystem.applyCustomDirectives(node);
//         }
//         Array.from(node.childNodes).forEach(processNode);
//       }
//     };

//     Array.from(container.childNodes).forEach(processNode);

//     container.querySelectorAll("*").forEach((element) => {
//       if (element instanceof HTMLElement) {
//         pluginSystem.applyCustomDirectives(element);

//         const processTextNode = (node) => {
//           const originalText = node.textContent || "";
//           if (originalText.includes("{") && originalText.includes("}")) {
//             const parts = originalText.split(/(\{.*?\})/);
//             const fragment = document.createDocumentFragment();

//             parts.forEach((part) => {
//               if (part.startsWith("{") && part.endsWith("}")) {
//                 const expression = part.slice(1, -1).trim();
//                 const expressionNode = document.createTextNode("");
//                 fragment.appendChild(expressionNode);

//                 const updateExpression = () => {
//                   try {
//                     const result = new Function(
//                       "state",
//                       `with(state) { return ${expression} }`
//                     )(state);
//                     expressionNode.textContent = result;
//                   } catch (error) {
//                     console.error(
//                       `Error evaluating expression: ${expression}`,
//                       error
//                     );
//                     expressionNode.textContent = "";
//                   }
//                 };

//                 updateExpression();
//                 Object.keys(state).forEach((key) => {
//                   (bindings[key] ??= []).push({
//                     update: updateExpression,
//                   });
//                 });
//               } else {
//                 fragment.appendChild(document.createTextNode(part));
//               }
//             });

//             node.parentNode.replaceChild(fragment, node);
//           }
//         };

//         element.childNodes.forEach((node) => {
//           if (node.nodeType === Node.TEXT_NODE) {
//             processTextNode(node);
//           }
//         });
//       }
//     });
//   };

//   Object.entries(components).forEach(([name, componentFunction]) => {
//     component(name, componentFunction);
//   });

//   const bindEvents = () => {
//     container.querySelectorAll("*").forEach((element) => {
//       Array.from(element.attributes).forEach((attr) => {
//         if (attr.name.startsWith("@")) {
//           const [eventName, ...modifiers] = attr.name.slice(1).split(".");
//           const expression = attr.value.trim();
//           const options = {
//             once: modifiers.includes("once"),
//             capture: modifiers.includes("capture"),
//           };

//           element.addEventListener(
//             eventName,
//             (event) => {
//               try {
//                 if (modifiers.includes("prevent")) event.preventDefault();
//                 if (modifiers.includes("stop")) event.stopPropagation();

//                 if (methods && methods[expression]) {
//                   methods[expression].call(state, event);
//                 } else {
//                   new Function(
//                     "state",
//                     "event",
//                     `with(state) { ${expression} }`
//                   ).call(state, state, event);
//                 }
//                 triggerUpdate();
//               } catch (error) {
//                 console.error(
//                   `Error executing event handler: ${expression}`,
//                   error
//                 );
//               }
//             },
//             options
//           );

//           element.removeAttribute(attr.name);
//         }
//       });
//     });
//   };

//   const emit = (eventName, payload) => {
//     (eventBus.get(eventName) ?? []).forEach((callback) => callback(payload));
//   };

//   const on = (eventName, callback) => {
//     if (!eventBus.has(eventName)) {
//       eventBus.set(eventName, []);
//     }
//     eventBus.get(eventName).push(callback);
//     return () => {
//       const callbacks = eventBus.get(eventName);
//       const index = callbacks.indexOf(callback);
//       if (index !== -1) {
//         callbacks.splice(index, 1);
//       }
//     };
//   };

//   const applyMixin = (mixin) => {
//     if (mixin.data) Object.assign(state, mixin.data());
//     if (mixin.methods) Object.assign(methods, mixin.methods);
//     if (mixin.computed) Object.assign(computed, mixin.computed);
//     if (mixin.watch) {
//       Object.entries(mixin.watch).forEach(([key, value]) => {
//         (watch[key] ??= []).push(value);
//       });
//     }
//     if (mixin.mounted) addHook("mounted", mixin.mounted);
//   };

//   mixins.forEach(applyMixin);

//   window.addEventListener("error", globalErrorHandler);

//   const render = (templateString) => {
//     const templateElement = document.createElement("template");
//     templateElement.innerHTML = templateString.trim();
//     return templateElement.content;
//   };

//   return {
//     mount: errorHandler(function (selector) {
//       container = document.querySelector(selector);
//       if (!container) {
//         throw new Error(`Element with selector "${selector}" not found.`);
//       }

//       runHooks("beforeCreate", state);
//       runHooks("created", state);

//       if (beforeMount) beforeMount.call(state);
//       runHooks("beforeMount", state);

//       pluginSystem.initializePlugins();

//       const templateElement = container.querySelector("template");
//       if (templateElement) {
//         container.innerHTML = templateElement.innerHTML;
//       }

//       processTemplate();
//       bindEvents();
//       initRefDirective(container, $refs);
//       initModelDirective(container, state, bindings, triggerUpdate);
//       initHtmlDirective(container, state, bindings);
//       initBindDirective(container, state, bindings);
//       initTransitionDirective(container);
//       triggerComputedUpdate();

//       container.querySelectorAll("[\\i-show]").forEach((el) => {
//         if (el instanceof HTMLElement) {
//           applyShowDirective(el, state, bindings);
//         }
//       });

//       if (mounted) mounted.call(state);
//       runHooks("mounted", state);

//       Object.keys(state).forEach((key) => updateBindings(key));
//     }, "Error mounting application"),
//     onUpdated,
//     createPlugin: pluginSystem.createPlugin.bind(pluginSystem),
//     emit,
//     on,
//     addLifecycleHook: addHook,
//     applyMixin,
//     component,
//     render,
//   };
// };

// export { createApp };

// 🚀 Fasten your seatbelts! We're about to embark on a routing adventure!
// Get ready for smooth navigation and dynamic content loading! 🗺️✨

import { reactive } from "./reactivity/reactivity.js";
import { createLifecycleHooks } from "./hooks/lifecycle.js";
import {
  applyIfDirective,
  applyForDirective,
  applyShowDirective,
  initModelDirective,
  initHtmlDirective,
  initBindDirective,
  initTransitionDirective,
  initRefDirective,
} from "./directives/directives.js";
import { PluginSystem } from "./plugin/plugins.js";
import {
  TemplateError,
  StateError,
  errorHandler,
  globalErrorHandler,
} from "./error/errorHandling.js";
import { createRouter } from "./router/router.js";

const createApp = ({
  data,
  computed,
  methods,
  watch,
  mounted,
  beforeMount,
  beforeUpdate,
  template,
  plugins = [],
  components = {},
  mixins = [],
  directives = {},
  routes = [],
}) => {
  let container;
  const bindings = {};
  const computedCache = {};
  const watchHandlers = {};
  const $refs = {};
  const eventBus = new Map();

  // Create a component registry
  const componentsRegistry = new Map();

  const { addHook, runHooks } = createLifecycleHooks();

  const component = (name, componentFunction) => {
    componentsRegistry.set(name, componentFunction);
  };

  const renderComponent = (name, props) => {
    const componentFunction = componentsRegistry.get(name);
    if (!componentFunction) {
      console.error(`Component "${name}" not found`);
      return "";
    }
    return componentFunction(props);
  };

  const triggerUpdate = (key) => {
    if (beforeUpdate)
      errorHandler(beforeUpdate, "Error in beforeUpdate hook").call(state, key);
    updateBindings(key);
    invalidateComputedCache();
    triggerWatchers(key);
    watchHandlers["__updated__"]?.forEach((handler) =>
      handler.callback.call(state)
    );
  };

  const state = reactive(
    {
      ...data,
      $refs: new Proxy($refs, {
        get: (target, key) => {
          const el = target[key];
          if (el instanceof HTMLElement) {
            return new Proxy(el, {
              get: (target, prop) => {
                if (typeof target[prop] === "function") {
                  return target[prop].bind(target);
                }
                return target[prop];
              },
            });
          }
          return el;
        },
        set: () => {
          throw new Error("$refs is read-only");
        },
      }),
    },
    triggerUpdate
  );

  const pluginSystem = new PluginSystem(state, bindings);

  Object.entries(directives).forEach(([name, handler]) => {
    pluginSystem.createPlugin(name, handler);
  });

  plugins.forEach((plugin) => pluginSystem.addPlugin(plugin));

  if (beforeMount)
    errorHandler(beforeMount, "Error in beforeMount hook", StateError).call(
      state
    );

  const pendingUpdates = new Set();

  const updateBindings = (key) => {
    if (bindings[key]) {
      pendingUpdates.add(key);
      requestAnimationFrame(() => {
        pendingUpdates.forEach((bindingKey) => {
          bindings[bindingKey].forEach(
            errorHandler((binding) => {
              if (binding.node) {
                binding.node.textContent = binding.originalText.replace(
                  /\{(.*?)\}/g,
                  (_, expression) => {
                    try {
                      return new Function(
                        "state",
                        `with(state) { return ${expression} }`
                      )(state);
                    } catch (error) {
                      console.error(
                        `Error evaluating expression: ${expression}`,
                        error
                      );
                      return "";
                    }
                  }
                );
              } else if (binding.element && binding.attrName) {
                binding.element.setAttribute(
                  binding.attrName,
                  state[bindingKey]
                );
                binding.element.removeAttribute(`:${binding.attrName}`);
              } else if (binding.update) {
                binding.update();
              }
            }, "Error updating bindings")
          );
        });
        pendingUpdates.clear();
      });
    }
  };

  const onUpdated = (callback) => {
    if (typeof callback === "function") {
      const wrappedCallback = errorHandler(
        callback,
        "Error in onUpdated callback"
      );
      (watchHandlers["__updated__"] ??= []).push({ callback: wrappedCallback });
    }
  };

  const invalidateComputedCache = () => {
    Object.keys(computedCache).forEach((key) => delete computedCache[key]);
  };

  const triggerWatchers = (key) => {
    if (watchHandlers[key]) {
      watchHandlers[key].forEach((handler) => {
        if (handler.debounce) {
          clearTimeout(handler.timeout);
          handler.timeout = setTimeout(
            () => handler.callback.call(state, state[key]),
            handler.debounce
          );
        } else if (handler.throttle) {
          if (
            !handler.lastCalled ||
            Date.now() - handler.lastCalled > handler.throttle
          ) {
            handler.callback.call(state, state[key]);
            handler.lastCalled = Date.now();
          }
        } else {
          handler.callback.call(state, state[key]);
        }
      });
    }
  };

  if (watch) {
    Object.entries(watch).forEach(([key, value]) => {
      watchHandlers[key] = Array.isArray(value)
        ? value.map((handler) => ({ callback: handler }))
        : [typeof value === "function" ? { callback: value } : { ...value }];
    });
  }

  const computedDependencies = {};
  const pendingPromises = {};

  if (computed) {
    Object.entries(computed).forEach(([key, originalComputed]) => {
      computedDependencies[key] = [];

      Object.defineProperty(state, key, {
        get: () => {
          if (
            typeof originalComputed === "function" &&
            originalComputed.constructor.name === "AsyncFunction"
          ) {
            if (pendingPromises[key]) return pendingPromises[key];

            computedCache[key] = new Proxy(state, {
              get: (target, dependencyKey) => {
                if (!computedDependencies[key].includes(dependencyKey)) {
                  computedDependencies[key].push(dependencyKey);
                }
                return target[dependencyKey];
              },
            });

            pendingPromises[key] = originalComputed
              .call(state)
              .then((result) => {
                computedCache[key] = result;
                delete pendingPromises[key];
                updateBindings(key);
                return result;
              })
              .catch((err) => {
                console.error(
                  `Error in async computed property "${key}":`,
                  err
                );
              });

            return pendingPromises[key];
          }

          if (!computedCache.hasOwnProperty(key)) {
            computedCache[key] = new Proxy(state, {
              get: (target, dependencyKey) => {
                if (!computedDependencies[key].includes(dependencyKey)) {
                  computedDependencies[key].push(dependencyKey);
                }
                return target[dependencyKey];
              },
            });

            computedCache[key] = originalComputed.call(state);
          }

          return computedCache[key];
        },
        enumerable: true,
      });
    });
  }

  const triggerComputedUpdate = (changedKey) => {
    Object.entries(computedDependencies).forEach(
      ([computedKey, dependencies]) => {
        if (dependencies.includes(changedKey)) {
          delete computedCache[computedKey];
          updateBindings(computedKey);
        }
      }
    );
  };

  const processCustomElements = (node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const componentName = node.tagName.toLowerCase();
      if (componentsRegistry.has(componentName)) {
        const componentFunction = componentsRegistry.get(componentName);
        const props = Array.from(node.attributes).reduce(
          (acc, attr) => ({ ...acc, [attr.name]: attr.value }),
          {}
        );
        const renderedComponent = componentFunction(props);
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = renderedComponent;
        const newNode = tempContainer.firstElementChild;
        if (newNode) {
          // Process event bindings
          Array.from(newNode.attributes).forEach((attr) => {
            if (attr.name.startsWith("@")) {
              const eventName = attr.name.slice(1);
              const methodName = attr.value;
              newNode.addEventListener(eventName, (event) => {
                if (
                  methods[methodName] &&
                  typeof methods[methodName] === "function"
                ) {
                  methods[methodName].call(state, event);
                }
              });
              newNode.removeAttribute(attr.name);
            }
          });
          node.parentNode?.replaceChild(newNode, node);
          return newNode;
        }
      }
    }
    return node;
  };

  const processTemplate = (content) => {
    const templateElement = document.createElement("template");
    templateElement.innerHTML = content.trim();
    container.innerHTML = "";
    container.appendChild(templateElement.content.cloneNode(true));

    const processNode = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        node = processCustomElements(node);
        if (node instanceof HTMLElement) {
          if (node.hasAttribute("i-if")) {
            applyIfDirective(node, state, bindings);
          }
          if (node.hasAttribute("i-for")) {
            applyForDirective(node, state, bindings);
          }
          if (node.hasAttribute("i-show")) {
            applyShowDirective(node, state, bindings);
          }
          pluginSystem.applyCustomDirectives(node);
        }
        Array.from(node.childNodes).forEach(processNode);
      }
    };

    Array.from(container.childNodes).forEach(processNode);

    container.querySelectorAll("*").forEach((element) => {
      if (element instanceof HTMLElement) {
        pluginSystem.applyCustomDirectives(element);

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

        element.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            processTextNode(node);
          }
        });
      }
    });
  };

  // Register components passed to createApp
  Object.entries(components).forEach(([name, componentFunction]) => {
    component(name, componentFunction);
  });

  const bindEvents = () => {
    container.querySelectorAll("*").forEach((element) => {
      Array.from(element.attributes).forEach((attr) => {
        if (attr.name.startsWith("@")) {
          const [eventName, ...modifiers] = attr.name.slice(1).split(".");
          const expression = attr.value.trim();
          const options = {
            once: modifiers.includes("once"),
            capture: modifiers.includes("capture"),
          };

          element.addEventListener(
            eventName,
            (event) => {
              try {
                if (modifiers.includes("prevent")) event.preventDefault();
                if (modifiers.includes("stop")) event.stopPropagation();

                if (methods && methods[expression]) {
                  methods[expression].call(state, event);
                } else {
                  new Function(
                    "state",
                    "event",
                    `with(state) { ${expression} }`
                  ).call(state, state, event);
                }
                triggerUpdate();
              } catch (error) {
                console.error(
                  `Error executing event handler: ${expression}`,
                  error
                );
              }
            },
            options
          );

          element.removeAttribute(attr.name);
        }
      });
    });
  };

  const emit = (eventName, payload) => {
    (eventBus.get(eventName) ?? []).forEach((callback) => callback(payload));
  };

  const on = (eventName, callback) => {
    if (!eventBus.has(eventName)) {
      eventBus.set(eventName, []);
    }
    eventBus.get(eventName).push(callback);
    return () => {
      const callbacks = eventBus.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  };

  const applyMixin = (mixin) => {
    if (mixin.data) Object.assign(state, mixin.data());
    if (mixin.methods) Object.assign(methods, mixin.methods);
    if (mixin.computed) Object.assign(computed, mixin.computed);
    if (mixin.watch) {
      Object.entries(mixin.watch).forEach(([key, value]) => {
        (watch[key] ??= []).push(value);
      });
    }
    if (mixin.mounted) addHook("mounted", mixin.mounted);
  };

  mixins.forEach(applyMixin);

  window.addEventListener("error", globalErrorHandler);

  const render = (templateString) => {
    const templateElement = document.createElement("template");
    templateElement.innerHTML = templateString.trim();
    return templateElement.content;
  };

  const router = createRouter(routes, state, (routeComponent) => {
    const content =
      typeof routeComponent === "function"
        ? routeComponent(state)
        : routeComponent;
    processTemplate(content);
    bindEvents();
    initRefDirective(container, $refs);
    initModelDirective(container, state, bindings, triggerUpdate);
    initHtmlDirective(container, state, bindings);
    initBindDirective(container, state, bindings);
    initTransitionDirective(container);
    triggerComputedUpdate();

    container.querySelectorAll("[\\i-show]").forEach((el) => {
      if (el instanceof HTMLElement) {
        applyShowDirective(el, state, bindings);
      }
    });

    Object.keys(state).forEach((key) => updateBindings(key));
  });

  return {
    mount: errorHandler(function (selector) {
      container = document.querySelector(selector);
      if (!container) {
        throw new Error(`Element with selector "${selector}" not found.`);
      }

      runHooks("beforeCreate", state);
      runHooks("created", state);

      if (beforeMount) beforeMount.call(state);
      runHooks("beforeMount", state);

      pluginSystem.initializePlugins();

      router.setAppElement(container);
      router.initialize();

      if (mounted) mounted.call(state);
      runHooks("mounted", state);
    }, "Error mounting application"),
    onUpdated,
    createPlugin: pluginSystem.createPlugin.bind(pluginSystem),
    emit,
    on,
    addLifecycleHook: addHook,
    applyMixin,
    component,
    render,
    router,
  };
};

export { createApp };
