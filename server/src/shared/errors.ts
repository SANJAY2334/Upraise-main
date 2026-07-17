export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_SERVER_ERROR",
    public details: any = null
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details: any = null) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: any = null) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}
