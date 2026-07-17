import * as Sentry from "@sentry/node";
import { AppError } from "../shared/errors.js";
import { logger } from "../shared/logger.js";
export function errorHandler(err, req, res, _next) {
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
    logger.error({
        msg: err instanceof Error ? err.message : "Unexpected server error",
        stack: err instanceof Error ? err.stack : undefined,
        requestId: reqId,
        url: req.originalUrl,
        method: req.method
    });
    return res.status(500).json({
        success: false,
        message: "Unexpected server error.",
        code: "INTERNAL_SERVER_ERROR",
        requestId: reqId
    });
}
