import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Thao tác thành công.',
  statusCode: number = 200,
  meta?: ApiResponse<T>['meta']
): Response => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(payload);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = 'Tạo mới thành công.'
): Response => {
  return sendSuccess(res, data, message, 201);
};

export const sendError = (
  res: Response,
  message: string = 'Đã có lỗi xảy ra.',
  statusCode: number = 500,
  errorCode: string = 'INTERNAL_SERVER_ERROR',
  details?: unknown
): Response => {
  const payload: ApiResponse = {
    success: false,
    message,
    error: {
      code: errorCode,
      ...(details !== undefined && { details }),
    },
  };
  return res.status(statusCode).json(payload);
};
