const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Set headers for TooManyRequestsError specifically
  if (err.statusCode === 429 && err.retryAfter) {
    res.setHeader("Retry-After", String(err.retryAfter));
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;
