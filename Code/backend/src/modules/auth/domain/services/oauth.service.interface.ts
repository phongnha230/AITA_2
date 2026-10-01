export interface GoogleUserInfo {
  googleId: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  emailVerified: boolean;
}

export interface IOAuthService {
  getGoogleAuthUrl(state?: string): string;
  getGoogleUserFromCode(code: string): Promise<GoogleUserInfo>;
  verifyGoogleIdToken(idToken: string): Promise<GoogleUserInfo>;
}
