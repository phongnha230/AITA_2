import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './presentation/routes/health.route.js';
import { errorHandler } from './presentation/middlewares/error.middleware.js';

dotenv.config();

const app: Express = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base Route
app.get('/', (req, res) => {
  res.json({
    project: 'AITA - AI-powered Teaching Assistant System',
    version: '1.0.0',
    course: 'SWD392 - AI-Assisted System Design',
    docs: '/api/v1/health',
  });
});

// API Routes
app.use('/api/v1', healthRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
