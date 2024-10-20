export const createRouter = (routes, state, processTemplate) => {
  let currentRoute = null;
  let appElement = null;

  const findRoute = (hash) =>
    routes.find(
      (route) => route.path === (hash.startsWith("#") ? hash.slice(1) : hash)
    );

  const renderComponent = (component) => {
    if (typeof component === "function") {
      return component(state);
    } else if (
      component &&
      typeof component === "object" &&
      component.default
    ) {
      // Handle ES module default exports
      const moduleComponent = component.default;
      return typeof moduleComponent === "function"
        ? moduleComponent(state)
        : moduleComponent;
    } else if (typeof component === "string") {
      // Handle string components (HTML)
      return component;
    }
    console.error("Invalid component:", component);
    return "";
  };

  const updateView = () => {
    if (appElement && currentRoute) {
      const content = renderComponent(currentRoute.component);
      processTemplate(content);
    }
  };

  const navigate = (path) => {
    window.location.hash = path;
  };

  const handleHashChange = () => {
    const hash = window.location.hash.slice(1);
    const route = findRoute(hash);
    if (route) {
      currentRoute = route;
      updateView();
    } else {
      console.error(`Route not found: ${hash}`);
    }
  };

  return {
    setAppElement: (element) => {
      appElement = element;
    },
    initialize: () => {
      window.addEventListener("hashchange", handleHashChange);
      if (!window.location.hash) {
        window.location.hash = "/";
      } else {
        handleHashChange();
      }
    },
    navigate,
  };
};
