import * as Sentry from "@sentry/node";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors.js";
import { logger } from "../shared/logger.js";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const reqId = req.id || "unknown";

  if (err instanceof AppError) {
    logger.warn({
      msg: err.message,
      statusCode: err.statusCode,
      code: err.code,
      details: err.details,
      requestId: reqId,
      url: req.originalUrl,
      method: req.method
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details,
      requestId: reqId
    });
  }

  // Capture unexpected internal server errors in Sentry
  Sentry.captureException(err, {
    extra: {
      requestId: reqId,
      url: req.originalUrl,
      method: req.method
    }
  });

  // Generic internal server error
  const errorObj = err instanceof Error ? err : new Error(String(err));
  const isPrismaError = !!(err && typeof err === "object" && ("code" in err || "meta" in err));

  logger.error(
    {
      message: errorObj.message,
      name: errorObj.name,
      stack: errorObj.stack,
      requestId: reqId,
      url: req.originalUrl,
      method: req.method,
      ...(isPrismaError
        ? {
            prismaCode: (err as any).code,
            prismaMeta: (err as any).meta
          }
        : {})
    },
    "Unexpected internal server error occurred"
  );

  return res.status(500).json({
    success: false,
    message: "Unexpected server error.",
    code: "INTERNAL_SERVER_ERROR",
    requestId: reqId
  });
}
