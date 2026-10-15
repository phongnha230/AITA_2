import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024;
const MAX_SOURCE_BYTES = 1024 * 1024;

export const enforceSandboxPayloadLimits = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const payloadBytes = Buffer.byteLength(JSON.stringify(req.body), 'utf8');
    const sourceBytes = Buffer.byteLength(String(req.body?.sourceCode ?? ''), 'utf8');
    if (payloadBytes > MAX_PAYLOAD_BYTES) {
      throw new ValidationError('Payload sandbox vượt quá giới hạn 5 MiB.');
    }
    if (sourceBytes > MAX_SOURCE_BYTES) {
      throw new ValidationError('Mã nguồn vượt quá giới hạn 1 MiB.');
    }
    next();
  } catch (error) {
    next(error);
  }
};
