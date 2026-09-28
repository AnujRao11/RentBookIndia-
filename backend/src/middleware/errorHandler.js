export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  console.error(error);
  if (error?.code === 11000) {
    const fields = Object.keys(error.keyPattern || {});
    return res.status(409).json({ success: false, message: `Duplicate value for: ${fields.join(", ")}` });
  }
  if (error?.name === "ValidationError") {
    return res.status(400).json({ success: false, message: "Validation failed", errors: Object.values(error.errors).map((e) => e.message) });
  }
  return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal server error" });
}
