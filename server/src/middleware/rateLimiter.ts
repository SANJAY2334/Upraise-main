import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 10,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in a minute.",
    code: "TOO_MANY_REQUESTS"
  },
  standardHeaders: "draft-7",
  legacyHeaders: false
});

export const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 5,
  message: {
    success: false,
    message: "Too many message submissions. Please try again later.",
    code: "TOO_MANY_REQUESTS"
  },
  standardHeaders: "draft-7",
  legacyHeaders: false
});
