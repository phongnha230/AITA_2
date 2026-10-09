import { Request, Response, NextFunction } from 'express';
import { JwtTokenService } from '../../infrastructure/services/jwt-token.service.js';
import { JwtPayload } from '../../domain/services/token.service.interface.js';
import { UnauthorizedError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';
import { Role } from '../../../user/domain/entities/user.entity.js';

// Extend Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const tokenService = new JwtTokenService();

export const authenticateJWT = (req: Request, _res: Response, next: NextFunction): void => {
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  // Hỗ trợ token từ query string cho SSE (Server-Sent Events) khi client không gửi được header
  if (!token && typeof req.query?.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    throw new UnauthorizedError('Vui lòng đăng nhập để tiếp tục (phiên đăng nhập hết hạn hoặc thiếu token).');
  }

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Người dùng chưa được xác thực.');
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ForbiddenError(
        `Bạn không có quyền thực hiện thao tác này. Quyền yêu cầu: [${allowedRoles.join(', ')}]`
      );
    }

    next();
  };
};
