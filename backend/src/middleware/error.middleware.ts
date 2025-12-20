import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors/app.error';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(err, res);
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: [{ message: err.message }]
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err instanceof ValidationError && { errors: (err as ValidationError).errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
    return;
  }

  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError, res: Response) => {
  switch (err.code) {
    case 'P2002':
      res.status(409).json({
        status: 'error',
        message: 'A record with this value already exists',
        field: err.meta?.target
      });
      break;
    case 'P2025':
      res.status(404).json({
        status: 'error',
        message: 'Record not found'
      });
      break;
    case 'P2003':
      res.status(400).json({
        status: 'error',
        message: 'Foreign key constraint failed'
      });
      break;
    default:
      res.status(400).json({
        status: 'error',
        message: 'Database error',
        code: err.code,
        ...(process.env.NODE_ENV === 'development' && { meta: err.meta })
      });
      break;
  }
};

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
