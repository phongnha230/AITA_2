import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5003),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis Queue
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),

  // Docker Sandbox
  USE_DOCKER_SANDBOX: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val.toLowerCase() === 'true' || val === '1';
    }
    return Boolean(val);
  }, z.boolean().default(true)),
  PLAYWRIGHT_SANDBOX_IMAGE: z.string().default('aita-playwright-sandbox:1.64.1'),
  PLAYWRIGHT_CONTROL_IMAGE: z.string().default('aita-playwright-control:1.0.0'),
  PLAYWRIGHT_SANDBOX_NETWORK: z.string().default('aita-playwright-internal'),

  // JWT Authentication
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),

  // Google OAuth 2.0
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5003/api/v1/auth/google/callback'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Storage & Workspaces
  UPLOAD_DIR: z.string().default('./uploads'),
  WORKSPACE_DIR: z.string().default('./workspaces'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(50),
  FER201_GRADING_ENABLED: z.preprocess(
    (value) => value === true || value === 'true' || value === '1',
    z.boolean().default(false)
  ),

  // Email SMTP & OTP
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().optional().default('AITA System <no-reply@aita.edu.vn>'),

  // Google reCAPTCHA v2
  RECAPTCHA_SECRET_KEY: z.string().optional().default(''),
  ALLOW_IN_MEMORY_AUTH_CHALLENGES: z.preprocess((value) => value === 'true', z.boolean().default(false)),
  DEV_FIXED_OTP: z.string().regex(/^\d{6}$/).optional(),

  // AI LLM & Vector DB
  CHROMA_DB_URL: z.string().optional().default('http://localhost:8000'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_API_KEYS: z.string().optional().default(''),
  GEMINI_KEY_SOURCE: z.literal('dashboard-first').default('dashboard-first'),
  GEMINI_ENV_KEY_FALLBACK: z.preprocess(
    (value) => value === undefined ? true : value === 'true' || value === true,
    z.boolean()
  ),
  AI_KEY_ENCRYPTION_KEY: z.string().optional().default(''),
  GEMINI_GENERATION_MODEL: z.string().default('gemini-3.8-flash'),
  GEMINI_EMBEDDING_MODEL: z.string().default('gemini-embedding-001'),
  AI_GRADING_REQUIRE_READY_RAG: z.preprocess(
    (value) => value === 'true',
    z.boolean().default(false)
  ),
  ALLOW_MOCK_LLM: z.preprocess((value) => value === 'true', z.boolean().default(false)),

  // Cloudinary Cloud Storage
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
}).superRefine((config, context) => {
  if (config.NODE_ENV === 'production' && config.DEV_FIXED_OTP) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DEV_FIXED_OTP'],
      message: 'DEV_FIXED_OTP is forbidden in production',
    });
  }
  if (config.COOKIE_SAME_SITE === 'none' && !config.FRONTEND_URL.startsWith('https://')) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['FRONTEND_URL'],
      message: 'SameSite=None requires an HTTPS frontend URL',
    });
  }
  if (config.AI_KEY_ENCRYPTION_KEY) {
    const decoded = Buffer.from(config.AI_KEY_ENCRYPTION_KEY, 'base64');
    const canonical = decoded.toString('base64').replace(/=+$/, '');
    const supplied = config.AI_KEY_ENCRYPTION_KEY.replace(/=+$/, '');
    if (decoded.length !== 32 || canonical !== supplied) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['AI_KEY_ENCRYPTION_KEY'],
        message: 'AI_KEY_ENCRYPTION_KEY must be valid base64 encoding exactly 32 bytes',
      });
    }
  } else if (config.NODE_ENV === 'production') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['AI_KEY_ENCRYPTION_KEY'],
      message: 'AI_KEY_ENCRYPTION_KEY is required in production',
    });
  }
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ [CONFIG ERROR] Invalid or missing environment variables:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;
export type EnvConfig = z.infer<typeof envSchema>;
export default env;
