import { IOAuthService, GoogleUserInfo } from '../../domain/services/oauth.service.interface.js';
import { env } from '../../../../infrastructure/config/env.js';
import { UnauthorizedError, AppError } from '../../../../shared/domain/exceptions/app.error.js';

export class GoogleOAuthService implements IOAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly callbackUrl: string;

  constructor() {
    this.clientId = env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = env.GOOGLE_CLIENT_SECRET || '';
    this.callbackUrl = env.GOOGLE_CALLBACK_URL;
  }

  getGoogleAuthUrl(state?: string): string {
    if (!this.clientId) {
      throw new AppError('GOOGLE_CLIENT_ID chưa được cấu hình trong .env', 500, 'OAUTH_CONFIG_MISSING');
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
      ...(state && { state }),
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async getGoogleUserFromCode(code: string): Promise<GoogleUserInfo> {
    if (!this.clientId || !this.clientSecret) {
      throw new AppError('Google OAuth Credentials chưa được cấu hình', 500, 'OAUTH_CONFIG_MISSING');
    }

    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('Google Token Exchange Failed:', errorData);
      throw new UnauthorizedError('Mã xác thực Google (code) không hợp lệ hoặc đã hết hạn.');
    }

    const tokens = (await tokenResponse.json()) as { access_token: string; id_token: string };

    // 2. Fetch User Profile from Google UserInfo endpoint
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new UnauthorizedError('Không thể lấy thông tin người dùng từ Google.');
    }

    const data = (await userInfoResponse.json()) as {
      sub: string;
      email: string;
      name: string;
      picture?: string;
      email_verified?: boolean;
    };

    return {
      googleId: data.sub,
      email: data.email,
      fullName: data.name || data.email.split('@')[0],
      avatarUrl: data.picture ?? null,
      emailVerified: Boolean(data.email_verified),
    };
  }

  async verifyGoogleIdToken(idToken: string): Promise<GoogleUserInfo> {
    // Verify ID Token directly with Google tokeninfo
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);

    if (!response.ok) {
      throw new UnauthorizedError('Google ID Token không hợp lệ hoặc đã hết hạn.');
    }

    const data = (await response.json()) as {
      sub: string;
      email: string;
      name: string;
      picture?: string;
      email_verified?: string | boolean;
      aud: string;
    };

    if (this.clientId && data.aud !== this.clientId) {
      throw new UnauthorizedError('Google ID Token không khớp với Client ID của ứng dụng.');
    }

    return {
      googleId: data.sub,
      email: data.email,
      fullName: data.name || data.email.split('@')[0],
      avatarUrl: data.picture ?? null,
      emailVerified: data.email_verified === 'true' || data.email_verified === true,
    };
  }
}
