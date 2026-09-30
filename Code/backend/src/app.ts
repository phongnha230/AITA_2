import express, { Express } from 'express';
import cors from 'cors';
import apiRouter from './presentation/routes/index.js';
import { errorHandler } from './shared/presentation/middlewares/error.middleware.js';

const app: Express = express();

// Global Middlewares
app.use(cors());
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
    },
  });
});

// API Routes (V1)
app.use('/api/v1', apiRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
