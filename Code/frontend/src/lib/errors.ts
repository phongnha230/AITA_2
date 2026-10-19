import axios from 'axios';

export const getErrorMessage = (error: unknown, fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.'): string => {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    if (!error.response) return 'Không kết nối được tới máy chủ API.';
    if (error.response.status >= 500) return 'Máy chủ đang gặp lỗi. Vui lòng thử lại sau.';
    const message = error.response.data?.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }
  return error instanceof Error ? error.message : fallback;
};
