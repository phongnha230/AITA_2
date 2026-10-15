import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { ITokenService, JwtPayload } from '../../domain/services/token.service.interface.js';
import { UnauthorizedError } from '../../../../shared/domain/exceptions/app.error.js';
import { env } from '../../../../infrastructure/config/env.js';

export class JwtTokenService implements ITokenService {
  private readonly secret: Secret;
  private readonly refreshSecret: Secret;
  private readonly expiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    this.secret = env.JWT_SECRET;
    this.refreshSecret = env.JWT_REFRESH_SECRET;
    this.expiresIn = env.JWT_EXPIRES_IN;
    this.refreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN;
  }

  generateAccessToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: this.expiresIn as SignOptions['expiresIn'] };
    return jwt.sign({ ...payload, tokenType: 'access' }, this.secret, options);
  }

  generateRefreshToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: this.refreshExpiresIn as SignOptions['expiresIn'] };
    return jwt.sign({ ...payload, tokenType: 'refresh' }, this.refreshSecret, options);
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, this.secret) as JwtPayload;
      if (payload.tokenType !== 'access') {
        throw new UnauthorizedError('Sai loại access token.');
      }
      return payload;
    } catch {
      throw new UnauthorizedError('Token không hợp lệ hoặc đã hết hạn.');
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, this.refreshSecret) as JwtPayload;
      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedError('Sai loại refresh token.');
      }
      return payload;
    } catch {
      throw new UnauthorizedError('Refresh token không hợp lệ hoặc đã hết hạn.');
    }
  }
}
