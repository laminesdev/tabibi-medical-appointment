export class AppError extends Error {
   public readonly statusCode: number;
   public readonly isOperational: boolean;

   constructor(message: string, statusCode: number, isOperational = true) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;

      // Set the prototype explicitly
      Object.setPrototypeOf(this, AppError.prototype);

      Error.captureStackTrace(this, this.constructor);
   }
}

export class BadRequestError extends AppError {
   constructor(message: string = "Bad Request") {
      super(message, 400);
      Object.setPrototypeOf(this, BadRequestError.prototype);
   }
}

export class UnauthorizedError extends AppError {
   constructor(message: string = "Unauthorized") {
      super(message, 401);
      Object.setPrototypeOf(this, UnauthorizedError.prototype);
   }
}

export class ForbiddenError extends AppError {
   constructor(message: string = "Forbidden") {
      super(message, 403);
      Object.setPrototypeOf(this, ForbiddenError.prototype);
   }
}

export class NotFoundError extends AppError {
   constructor(message: string = "Not Found") {
      super(message, 404);
      Object.setPrototypeOf(this, NotFoundError.prototype);
   }
}

export class ConflictError extends AppError {
   constructor(message: string = "Conflict") {
      super(message, 409);
      Object.setPrototypeOf(this, ConflictError.prototype);
   }
}

export class ValidationError extends AppError {
   constructor(message: string = "Validation Error", public errors?: any[]) {
      super(message, 422);
      Object.setPrototypeOf(this, ValidationError.prototype);
   }
}

export class InternalServerError extends AppError {
   constructor(message: string = "Internal Server Error") {
      super(message, 500);
      Object.setPrototypeOf(this, InternalServerError.prototype);
   }
}
