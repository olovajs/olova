class TemplateError extends Error {
  constructor(message) {
    super(message);
    this.name = "TemplateError";
  }
}

class StateError extends Error {
  constructor(message) {
    super(message);
    this.name = "StateError";
  }
}

const errorHandler = (fn, errorMessage, errorType = Error) => {
  return function (...args) {
    try {
      return fn.apply(this, args);
    } catch (error) {
      throw new errorType(`${errorMessage}: ${error.message}`);
    }
  };
};

const globalErrorHandler = (error) => {
  console.error("Global error:", error);
};

export { TemplateError, StateError, errorHandler, globalErrorHandler };
