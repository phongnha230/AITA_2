import { describe, expect, it, vi } from 'vitest';

const { api } = vi.hoisted(() => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/api', () => ({ default: api }));

const { adminAiKeyService } = await import(
  '../src/features/admin/services/admin-ai-key.service'
);

describe('adminAiKeyService API contracts', () => {
  it('returns the authoritative backend status after toggling a key', async () => {
    api.patch.mockResolvedValue({
      data: {
        data: {
          id: 'key-1',
          provider: 'GEMINI',
          keyAlias: 'Primary',
          keyHint: '1234',
          dailyRequestLimit: 100,
          currentRequestsToday: 2,
          rpmLimit: 10,
          consecutiveFailures: 0,
          isActive: false,
          availabilityStatus: 'DISABLED',
          createdAt: '2026-10-14T00:00:00.000Z',
          updatedAt: '2026-10-14T00:00:00.000Z',
        },
      },
    });

    const result = await adminAiKeyService.setActive('key-1', false);

    expect(result).toMatchObject({ isActive: false, availabilityStatus: 'DISABLED' });
    expect(api.patch).toHaveBeenCalledWith('/ai/api-keys/key-1/toggle', { isActive: false });
  });
});
