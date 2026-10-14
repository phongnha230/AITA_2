import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/exceptions/app.error.js';
import { sendError } from '../utils/api-response.util.js';
import { logger } from '../../../infrastructure/logging/logger.js';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errorCode, err.details);
    return;
  }

  logger.error('request_unhandled_error', {
    requestId: req.header('x-request-id'),
    method: req.method,
    path: req.path,
    error: err,
  });

  const isDevelopment = process.env.NODE_ENV === 'development';
  sendError(
    res,
    isDevelopment ? err.message : 'Đã có lỗi xảy ra trên hệ thống.',
    500,
    'INTERNAL_SERVER_ERROR',
    isDevelopment ? err.stack : undefined
  );
};
