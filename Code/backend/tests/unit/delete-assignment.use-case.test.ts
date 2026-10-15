import { describe, expect, it, vi } from 'vitest';
import { DeleteAssignmentUseCase } from '../../src/modules/assignment/application/use-cases/delete-assignment.use-case.js';

describe('DeleteAssignmentUseCase', () => {
  it('deletes an unused assignment and cleans its RAG vectors', async () => {
    const deleteIfNoSubmissions = vi.fn().mockResolvedValue('DELETED');
    const deleteAssignment = vi.fn().mockResolvedValue(undefined);
    const useCase = new DeleteAssignmentUseCase(
      { deleteIfNoSubmissions },
      { deleteAssignment }
    );

    await useCase.execute('assignment-1');

    expect(deleteIfNoSubmissions).toHaveBeenCalledWith('assignment-1');
    expect(deleteAssignment).toHaveBeenCalledWith('assignment-1');
  });

  it('rejects deletion when submissions already exist', async () => {
    const deleteIfNoSubmissions = vi.fn().mockResolvedValue('HAS_SUBMISSIONS');
    const deleteAssignment = vi.fn();
    const useCase = new DeleteAssignmentUseCase(
      { deleteIfNoSubmissions },
      { deleteAssignment }
    );

    await expect(useCase.execute('assignment-1')).rejects.toMatchObject({
      statusCode: 409,
      errorCode: 'CONFLICT',
    });
    expect(deleteAssignment).not.toHaveBeenCalled();
  });

  it('returns not found for an unknown assignment', async () => {
    const deleteIfNoSubmissions = vi.fn().mockResolvedValue('NOT_FOUND');
    const useCase = new DeleteAssignmentUseCase(
      { deleteIfNoSubmissions },
      { deleteAssignment: vi.fn() }
    );

    await expect(useCase.execute('missing')).rejects.toMatchObject({
      statusCode: 404,
      errorCode: 'RESOURCE_NOT_FOUND',
    });
  });

  it('keeps the successful database deletion when vector cleanup is unavailable', async () => {
    const useCase = new DeleteAssignmentUseCase(
      { deleteIfNoSubmissions: vi.fn().mockResolvedValue('DELETED') },
      { deleteAssignment: vi.fn().mockRejectedValue(new Error('chroma unavailable')) }
    );

    await expect(useCase.execute('assignment-1')).resolves.toBeUndefined();
  });
});
