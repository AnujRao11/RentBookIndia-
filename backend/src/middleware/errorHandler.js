export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  console.error(error);
  if (error?.code === 11000) {
    const fields = Object.keys(error.keyPattern || {});
    return res.status(409).json({ success: false, message: `Duplicate value for: ${fields.join(", ")}` });
  }
  if (error?.name === "ValidationError") {
    return res.status(400).json({ success: false, message: "Validation failed", errors: Object.values(error.errors).map((e) => e.message) });
  }
  const status = error.statusCode || 500;
  const message = status >= 500 ? "Internal server error" : (error.message || "Request failed");
  return res.status(status).json({ success: false, message });
}
