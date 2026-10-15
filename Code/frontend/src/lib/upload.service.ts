import api from './api';

export interface AvatarUploadResponse {
  avatarUrl: string;
  user: unknown;
}

export const uploadService = {
  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
};

export default uploadService;
