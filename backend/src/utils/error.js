class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests. Please try again later.", retryAfter = 60) {
    super(message, 429);
    this.retryAfter = retryAfter;
  }
}

module.exports = {
  AppError,
  TooManyRequestsError,
};
