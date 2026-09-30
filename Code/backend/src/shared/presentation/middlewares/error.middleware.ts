import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/exceptions/app.error.js';
import { sendError } from '../utils/api-response.util.js';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errorCode, err.details);
    return;
  }

  console.error('🔥 [Unhandled Error]:', err);

  const isDevelopment = process.env.NODE_ENV === 'development';
  sendError(
    res,
    isDevelopment ? err.message : 'Đã có lỗi xảy ra trên hệ thống.',
    500,
    'INTERNAL_SERVER_ERROR',
    isDevelopment ? err.stack : undefined
  );
};
