export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  fullName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface ITokenService {
  generateAccessToken(payload: JwtPayload): string;
  generateRefreshToken(payload: JwtPayload): string;
  verifyAccessToken(token: string): JwtPayload;
  verifyRefreshToken(token: string): JwtPayload;
}
