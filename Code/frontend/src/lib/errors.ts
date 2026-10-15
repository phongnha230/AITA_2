import axios from 'axios';

export const getErrorMessage = (error: unknown, fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.'): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Không kết nối được tới máy chủ API.';
    return error.response.data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};
