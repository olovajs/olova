export function reactive(obj, triggerUpdate) {
  return new Proxy(obj, {
    get(target, key) {
      return typeof target[key] === "object" && target[key] !== null
        ? reactive(target[key], triggerUpdate)
        : target[key];
    },
    set(target, key, value) {
      if (target[key] !== value) {
        target[key] = value;
        triggerUpdate(key);
      }
      return true;
    },
  });
}
