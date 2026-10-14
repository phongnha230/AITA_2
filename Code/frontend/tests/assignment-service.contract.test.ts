import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api } = vi.hoisted(() => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/api', () => ({ default: api }));
vi.mock('../src/features/auth/services/auth.service', () => ({
  authService: { getStoredUser: () => ({ id: 'lecturer-1', role: 'LECTURER' }) },
}));

const { assignmentService } = await import(
  '../src/features/assignments/services/assignment.service'
);

describe('assignmentService API contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses POST for the backend rubric replacement endpoint', async () => {
    const rules = [{
      criterionName: 'Correctness',
      description: 'Handles all cases',
      maxPoints: 1,
      weight: 1,
      orderIndex: 1,
    }];
    api.post.mockResolvedValue({ data: { data: [] } });

    await assignmentService.setRubricRules('assignment-1', rules);

    expect(api.post).toHaveBeenCalledWith('/assignments/assignment-1/rubrics', { rules });
    expect(api.put).not.toHaveBeenCalled();
  });

  it('calls the protected assignment deletion endpoint', async () => {
    api.delete.mockResolvedValue({ data: { success: true } });

    await assignmentService.deleteAssignment('assignment-1');

    expect(api.delete).toHaveBeenCalledWith('/assignments/assignment-1');
  });
});
