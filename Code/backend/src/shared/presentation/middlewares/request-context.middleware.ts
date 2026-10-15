import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

export function attachRequestContext(req: Request, res: Response, next: NextFunction): void {
  const supplied = req.header('x-request-id');
  const requestId = supplied && /^[a-zA-Z0-9._-]{1,100}$/.test(supplied) ? supplied : randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}
