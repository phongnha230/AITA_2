import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { ITokenService, JwtPayload } from '../../domain/services/token.service.interface.js';
import { UnauthorizedError } from '../../../../shared/domain/exceptions/app.error.js';

export class JwtTokenService implements ITokenService {
  private readonly secret: Secret;
  private readonly refreshSecret: Secret;
  private readonly expiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'aita_super_secret_jwt_key_2025';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'aita_super_secret_jwt_refresh_key_2025';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '8h';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  }

  generateAccessToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: this.expiresIn as any };
    return jwt.sign(payload, this.secret, options);
  }

  generateRefreshToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: this.refreshExpiresIn as any };
    return jwt.sign(payload, this.refreshSecret, options);
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Token không hợp lệ hoặc đã hết hạn.');
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.refreshSecret) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Refresh token không hợp lệ hoặc đã hết hạn.');
    }
  }
}
