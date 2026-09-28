import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/app-error.js';
import { ApiResponse } from '../../shared/types/api-response.type.js';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error Middleware]:', err);

  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const errorCode = isAppError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
  const message = err instanceof Error ? err.message : 'Internal Server Error';

  const body: ApiResponse<never> = {
    success: false,
    message,
    error: {
      code: errorCode,
      details: isAppError ? err.details : undefined,
    },
  };

  res.status(statusCode).json(body);
};
