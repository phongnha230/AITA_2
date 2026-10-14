import { NextFunction, Request, Response } from 'express';
import { env } from '../../../infrastructure/config/env.js';
import { ForbiddenError } from '../../domain/exceptions/app.error.js';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
const allowedOrigins = new Set([
  env.FRONTEND_URL,
  ...(env.NODE_ENV !== 'production' ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : []),
]);

export const enforceTrustedOrigin = (req: Request, _res: Response, next: NextFunction): void => {
  if (safeMethods.has(req.method)) {
    next();
    return;
  }

  const origin = req.get('origin');
  if (!origin && env.NODE_ENV !== 'production') {
    next();
    return;
  }

  if (!origin || !allowedOrigins.has(origin)) {
    next(new ForbiddenError('Nguồn yêu cầu không được phép.'));
    return;
  }

  next();
};
