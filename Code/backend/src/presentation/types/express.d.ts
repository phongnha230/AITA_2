// Temporary ambient shim so downstream modules can read `req.user` before
// Thành viên 1's `auth.middleware.ts` (verifyToken) lands and populates it.
// Safe to remove once that middleware defines this augmentation itself.
declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      role: 'ADMIN' | 'LECTURER' | 'STUDENT';
    };
  }
}
