import express, { type Express } from 'express';
import request from 'supertest';
import { z } from 'zod';
import { beforeEach, describe, expect, it } from 'vitest';
import { errorHandler } from '../../src/shared/presentation/middlewares/error.middleware.js';
import { validateBody } from '../../src/shared/presentation/middlewares/validate.middleware.js';

const payloadSchema = z.object({
  name: z.string().min(2),
});

describe('request validation middleware', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/payload', validateBody(payloadSchema), (req, res) => {
      res.status(201).json({ success: true, data: req.body });
    });
    app.use(errorHandler);
  });

  it('passes validated payloads to the route handler', async () => {
    const response = await request(app).post('/payload').send({ name: 'AITA' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ success: true, data: { name: 'AITA' } });
  });

  it('returns the standard validation error response', async () => {
    const response = await request(app).post('/payload').send({ name: '' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
  });
});
