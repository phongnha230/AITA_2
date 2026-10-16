import { describe, expect, it } from 'vitest';
import { storeAssignmentFiles } from '../../src/modules/assignment/infrastructure/storage/assignment-file.storage.js';

describe('assignment file storage', () => {
  it('rejects path-like assignment ids before creating an upload directory', async () => {
    await expect(storeAssignmentFiles('../outside', {})).rejects.toMatchObject({
      statusCode: 400,
      errorCode: 'VALIDATION_FAILED',
    });
  });
});
