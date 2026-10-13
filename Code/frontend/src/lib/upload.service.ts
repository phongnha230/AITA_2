import api from './api';

export interface CloudinaryUploadResponse {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
  resourceType: 'image' | 'raw' | 'video';
  originalFilename?: string;
}

export const uploadService = {
  /**
   * Kiểm tra xem Cloudinary đã được bật và cấu hình trên backend chưa
   */
  async checkStatus(): Promise<{ configured: boolean; message: string }> {
    const response = await api.get('/upload/status');
    return response.data.data;
  },

  /**
   * Upload hình ảnh lên Cloudinary (PNG, JPG, WEBP, GIF...)
   */
  async uploadImage(file: File, folder: string = 'aita/images'): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  },

  /**
   * Upload tài liệu PDF lên Cloudinary (Đề bài, hướng dẫn, bài giảng...)
   */
  async uploadPdf(file: File, folder: string = 'aita/documents'): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await api.post('/upload/pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  },

  /**
   * Upload file ZIP lên Cloudinary (Source code bài nộp, file tài liệu nén...)
   */
  async uploadZip(file: File, folder: string = 'aita/submissions'): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await api.post('/upload/zip', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  },

  /**
   * Upload ảnh đại diện và tự động cập nhật vào tài khoản người dùng
   */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string; user: any }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  },

  /**
   * Xóa file trên Cloudinary bằng publicId
   */
  async deleteFile(publicId: string, resourceType: 'image' | 'raw' = 'image'): Promise<boolean> {
    const response = await api.delete('/upload', {
      data: { publicId, resourceType },
    });
    return response.data.success;
  },
};

export default uploadService;
