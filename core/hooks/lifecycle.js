export function createLifecycleHooks() {
  const hooks = {
    beforeCreate: [],
    created: [],
    beforeMount: [],
    mounted: [],
    beforeUpdate: [],
    updated: [],
    beforeUnmount: [],
    unmounted: [],
  };

  function addHook(hookName, callback) {
    if (hooks[hookName]) {
      hooks[hookName].push(callback);
    }
  }

  function runHooks(hookName, context) {
    hooks[hookName]?.forEach((hook) => hook.call(context));
  }

  return { addHook, runHooks };
}
