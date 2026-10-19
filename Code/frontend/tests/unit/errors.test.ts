import { describe, expect, it } from 'vitest';
import { getErrorMessage } from '../../src/lib/errors';

function apiError(status: number, message: unknown) {
  return {
    isAxiosError: true,
    response: { status, data: { message } },
  };
}

describe('getErrorMessage', () => {
  it('hides server details from the UI', () => {
    expect(getErrorMessage(apiError(500, 'Invalid Prisma query at C:\\backend\\src')))
      .toBe('Máy chủ đang gặp lỗi. Vui lòng thử lại sau.');
  });

  it('keeps actionable validation messages', () => {
    expect(getErrorMessage(apiError(400, 'Dữ liệu chưa hợp lệ.'))).toBe('Dữ liệu chưa hợp lệ.');
  });

  it('uses the fallback for malformed response messages', () => {
    expect(getErrorMessage(apiError(400, { internal: true }), 'Không tải được dữ liệu.'))
      .toBe('Không tải được dữ liệu.');
  });
});
