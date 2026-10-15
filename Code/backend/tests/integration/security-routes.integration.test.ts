import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../src/app.js';
import { JwtTokenService } from '../../src/modules/auth/infrastructure/services/jwt-token.service.js';

const tokens = new JwtTokenService();
const cookieFor = (role: 'ADMIN' | 'LECTURER' | 'STUDENT'): string => {
  const token = tokens.generateAccessToken({
    userId: `${role.toLowerCase()}-1`,
    email: `${role.toLowerCase()}@example.com`,
    fullName: role,
    role,
  });
  return `token=${token}`;
};

describe('hardened upload and sandbox routes', () => {
  it.each(['/api/v1/upload/image', '/api/v1/upload/pdf', '/api/v1/upload/zip'])(
    'does not expose the removed generic endpoint %s',
    async (endpoint) => {
      const response = await request(app)
        .post(endpoint)
        .set('Cookie', cookieFor('ADMIN'))
        .send({});
      expect(response.status).toBe(404);
    }
  );

  it('does not expose the generic delete endpoint', async () => {
    const response = await request(app)
      .delete('/api/v1/upload')
      .set('Cookie', cookieFor('ADMIN'))
      .send({ publicId: 'anything' });
    expect(response.status).toBe(404);
  });

  it('restricts upload status to ADMIN and returns configuration state only', async () => {
    await request(app)
      .get('/api/v1/upload/status')
      .set('Cookie', cookieFor('STUDENT'))
      .expect(403);

    const response = await request(app)
      .get('/api/v1/upload/status')
      .set('Cookie', cookieFor('ADMIN'))
      .expect(200);
    expect(response.body.data).toEqual({ configured: expect.any(Boolean) });
  });

  it('keeps public sandbox health minimal and direct execution ADMIN-only', async () => {
    const health = await request(app).get('/api/v1/sandbox/health').expect(200);
    expect(health.body).toEqual({ status: 'ready' });

    await request(app)
      .get('/api/v1/sandbox/status')
      .set('Cookie', cookieFor('STUDENT'))
      .expect(403);

    await request(app)
      .post('/api/v1/sandbox/execute')
      .set('Cookie', cookieFor('STUDENT'))
      .send({})
      .expect(403);
  });
});
