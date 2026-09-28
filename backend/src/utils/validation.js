import { fail } from "./response.js";

export function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return fail(res, "Validation failed", 400, {
        errors: result.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }))
      });
    }
    Object.defineProperty(req, source, {
      value: result.data,
      configurable: true,
      enumerable: true,
      writable: true
    });
    next();
  };
}

export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
