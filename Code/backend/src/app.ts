import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRouter from './presentation/routes/index.js';
import { errorHandler } from './shared/presentation/middlewares/error.middleware.js';
import { env } from './infrastructure/config/env.js';

const app: Express = express();

const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

// Global Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base / Welcome Route
app.get('/', (_req, res) => {
  res.json({
    project: 'AITA - AI-powered Teaching Assistant System',
    version: '1.0.0',
    course: 'SWD392 - AI-Assisted System Design',
    status: 'online',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      courses: '/api/v1/courses',
      assignments: '/api/v1/assignments',
      submissions: '/api/v1/submissions',
      sandbox: '/api/v1/sandbox',
      ai: '/api/v1/ai',
      teams: '/api/v1/teams',
    },
  });
});

// API Routes (V1)
app.use('/api/v1', apiRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
