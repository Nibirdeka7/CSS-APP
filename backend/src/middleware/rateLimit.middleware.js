const redis = require("../config/redis");
const { TooManyRequestsError } = require("../utils/error");

const logger = {
  error: (...args) => console.error("🔴 RateLimiter Error:", ...args),
  warn: (...args) => console.warn("⚠️ RateLimiter Warn:", ...args),
  info: (...args) => console.log("ℹ️ RateLimiter Info:", ...args),
};

const RATE_LIMIT_MAX_REQUESTS = process.env.RATE_LIMIT_MAX_REQUESTS
  ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
  : 100;

const RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS
  ? parseInt(process.env.RATE_LIMIT_WINDOW_MS)
  : 15 * 60 * 1000; // 15 minutes by default

/**
 * Generic rate limiter using sliding window algorithm with @upstash/redis
 */
async function rateLimiter(key, maxRequests, windowMs) {
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();

    // Remove old entries outside the current window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Add current request
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });

    // Count requests in current window
    pipeline.zcard(key);

    // Set expiry on the key
    pipeline.expire(key, Math.ceil(windowMs / 1000));

    const results = await pipeline.exec();

    // In @upstash/redis, pipeline.exec() returns a flat array of results.
    // Index 2 corresponds to the result of pipeline.zcard(key)
    const requestCount = results[2];

    if (requestCount > maxRequests) {
      const oldestRequest = await redis.zrange(key, 0, 0, { withScores: true });
      let resetTime = now + windowMs;
      if (oldestRequest && oldestRequest.length >= 2) {
        const scoreVal = parseFloat(oldestRequest[1]);
        if (!isNaN(scoreVal)) {
          resetTime = scoreVal + windowMs;
        }
      }
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter,
      };
    }

    return {
      allowed: true,
      remaining: maxRequests - requestCount,
      resetTime: windowStart + windowMs,
    };
  } catch (err) {
    logger.error("Rate limiter error:", err);
    // Fail open - allow request if Redis is down
    return {
      allowed: true,
      remaining: maxRequests,
      resetTime: now + windowMs,
    };
  }
}

/**
 * IP-based rate limiting middleware
 */
function ipRateLimit(options = {}) {
  const maxRequests = options.max || RATE_LIMIT_MAX_REQUESTS;
  const windowMs = options.windowMs || RATE_LIMIT_WINDOW_MS;

  return async (req, res, next) => {
    const rawIp = req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress;
    // Format IP to prevent spaces or commas if multiple proxies exist
    const ip = typeof rawIp === "string" ? rawIp.split(",")[0].trim() : rawIp;
    const key = `ratelimit:ip:${ip}`;

    const result = await rateLimiter(key, maxRequests, windowMs);

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      res.setHeader("Retry-After", result.retryAfter);
      logger.warn(`Rate limit exceeded for IP: ${ip}`);
      return next(
        new TooManyRequestsError(
          `Too many requests. Please try again in ${result.retryAfter} seconds`,
          result.retryAfter
        )
      );
    }

    next();
  };
}

/**
 * User-based rate limiting middleware
 */
function userRateLimit(options = {}) {
  const maxRequests = options.max || RATE_LIMIT_MAX_REQUESTS * 10;
  const windowMs = options.windowMs || RATE_LIMIT_WINDOW_MS;

  return async (req, res, next) => {
    // Skip if no user authenticated
    if (!req.user || !req.user.id) {
      return next();
    }

    const userId = req.user.id;
    const key = `ratelimit:user:${userId}`;

    const result = await rateLimiter(key, maxRequests, windowMs);

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      res.setHeader("Retry-After", result.retryAfter);
      logger.warn(`Rate limit exceeded for user: ${userId}`);
      return next(
        new TooManyRequestsError(
          `Too many requests. Please try again in ${result.retryAfter} seconds`,
          result.retryAfter
        )
      );
    }

    next();
  };
}

/**
 * Endpoint-specific rate limiting
 */
function endpointRateLimit(maxRequests, windowMs) {
  return async (req, res, next) => {
    const rawIp = req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress;
    const ip = typeof rawIp === "string" ? rawIp.split(",")[0].trim() : rawIp;
    const endpoint = `${req.method}:${req.path}`;
    const key = `ratelimit:endpoint:${endpoint}:${ip}`;

    const result = await rateLimiter(key, maxRequests, windowMs);

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      res.setHeader("Retry-After", result.retryAfter);
      logger.warn(`Endpoint rate limit exceeded for ${endpoint} from IP: ${ip}`);
      return next(
        new TooManyRequestsError(
          `Too many requests to this endpoint. Please try again in ${result.retryAfter} seconds`,
          result.retryAfter
        )
      );
    }

    next();
  };
}

/**
 * Combined rate limiting strategy
 */
function combinedRateLimit(ipOptions = {}, userOptions = {}) {
  const ipLimiter = ipRateLimit(ipOptions);
  const userLimiter = userRateLimit(userOptions);

  return async (req, res, next) => {
    // Apply IP rate limit first
    ipLimiter(req, res, (err) => {
      if (err) return next(err);

      // Then apply user rate limit if authenticated
      userLimiter(req, res, next);
    });
  };
}

module.exports = {
  ipRateLimit,
  userRateLimit,
  endpointRateLimit,
  combinedRateLimit,
};
