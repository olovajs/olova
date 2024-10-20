export const initTransitionDirective = (container) => {
  const transitionHooks = {
    beforeEnter: (el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(-20px)";
      el.style.display = "";
    },
    enter: (el, done) => {
      const duration =
        parseFloat(getComputedStyle(el).transitionDuration) * 1000;
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
        setTimeout(done, duration);
      });
    },
    afterEnter: (el) => {
      el.style.opacity = "";
      el.style.transform = "";
    },
    enterCancelled: (el) => {
      el.style.opacity = "";
      el.style.transform = "";
    },
    beforeLeave: (el) => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    },
    leave: (el, done) => {
      const duration =
        parseFloat(getComputedStyle(el).transitionDuration) * 1000;
      requestAnimationFrame(() => {
        el.style.opacity = "0";
        el.style.transform = "translateY(-20px)";
        setTimeout(done, duration);
      });
    },
    afterLeave: (el) => {
      el.style.display = "none";
      el.style.opacity = "";
      el.style.transform = "";
    },
    leaveCancelled: (el) => {
      el.style.opacity = "";
      el.style.transform = "";
    },
  };

  container.querySelectorAll("[i-transition]").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;

    const transitionAttr = el.getAttribute("i-transition");
    if (!transitionAttr) return;

    const [transitionName, customDuration, customEasing] = transitionAttr
      .split(",")
      .map((s) => s.trim());
    const duration = customDuration ? `${customDuration}ms` : "300ms";
    const easing = customEasing || "ease";

    el.style.transition = `opacity ${duration} ${easing}, transform ${duration} ${easing}`;

    const runHooks = (hooks, callback) => {
      return new Promise((resolve) => {
        let cancelled = false;
        const done = () => {
          if (!cancelled) {
            hooks.after(el);
            if (callback) callback();
            resolve();
          }
        };

        hooks.before(el);
        hooks.during(el, done);

        return () => {
          cancelled = true;
          hooks.cancelled(el);
          resolve();
        };
      });
    };

    const show = async (callback) => {
      el.style.display = "";
      await runHooks(
        {
          before: transitionHooks.beforeEnter,
          during: transitionHooks.enter,
          after: transitionHooks.afterEnter,
          cancelled: transitionHooks.enterCancelled,
        },
        callback
      );
    };

    const hide = async (callback) => {
      await runHooks(
        {
          before: transitionHooks.beforeLeave,
          during: transitionHooks.leave,
          after: transitionHooks.afterLeave,
          cancelled: transitionHooks.leaveCancelled,
        },
        callback
      );
    };

    el._transitionShow = show;
    el._transitionHide = hide;

    el.style.display = "none";

    el.removeAttribute("i-transition");
  });
};
