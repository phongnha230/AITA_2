import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from 'cloudinary';
import { Readable } from 'node:stream';
import { env } from '../config/env.js';
import { AppError, ValidationError } from '../../shared/domain/exceptions/app.error.js';

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  resourceType: 'image' | 'raw' | 'video';
  bytes: number;
  originalFilename?: string;
  createdAt: string;
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  filename?: string;
  overwrite?: boolean;
}

export class CloudinaryService {
  private configured: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
        secure: true,
      });
      this.configured = true;
    } else {
      this.configured = false;
    }
  }

  /**
   * Kiểm tra xem cấu hình Cloudinary đã được cung cấp trong .env hay chưa
   */
  public isConfigured(): boolean {
    return this.configured;
  }

  /**
   * Upload file Ảnh (Avatar, ảnh minh họa đề bài, sơ đồ)
   * Tự động áp dụng tối ưu nén ảnh WebP/AVIF và chất lượng tự động của Cloudinary
   */
  public async uploadImage(
    file: string | Buffer | Express.Multer.File,
    options?: UploadOptions
  ): Promise<CloudinaryUploadResult> {
    const uploadOptions: UploadApiOptions = {
      resource_type: 'image',
      folder: options?.folder || 'aita/images',
      public_id: options?.publicId,
      tags: options?.tags,
      overwrite: options?.overwrite ?? true,
    };

    return this.executeUpload(file, uploadOptions);
  }

  /**
   * Upload tài liệu PDF (Đề bài, tài liệu tham khảo, bài giảng)
   * Sử dụng resource_type: 'auto' hoặc 'raw' để lưu trữ nguyên vẹn tài liệu PDF
   */
  public async uploadPdf(
    file: string | Buffer | Express.Multer.File,
    options?: UploadOptions
  ): Promise<CloudinaryUploadResult> {
    const uploadOptions: UploadApiOptions = {
      resource_type: 'raw',
      folder: options?.folder || 'aita/documents',
      public_id: options?.publicId,
      tags: options?.tags,
      use_filename: true,
      unique_filename: true,
      overwrite: options?.overwrite ?? true,
    };

    return this.executeUpload(file, uploadOptions);
  }

  /**
   * Upload file ZIP (Source code bài nộp sinh viên, tài liệu nén)
   * Sử dụng resource_type: 'raw' để Cloudinary lưu trữ nguyên bản file nhị phân
   */
  public async uploadZip(
    file: string | Buffer | Express.Multer.File,
    options?: UploadOptions
  ): Promise<CloudinaryUploadResult> {
    const uploadOptions: UploadApiOptions = {
      resource_type: 'raw',
      folder: options?.folder || 'aita/submissions',
      public_id: options?.publicId,
      tags: options?.tags || ['submission', 'zip'],
      use_filename: true,
      unique_filename: true,
      overwrite: options?.overwrite ?? true,
    };

    return this.executeUpload(file, uploadOptions);
  }

  /**
   * Xóa file trên Cloudinary bằng publicId
   */
  public async deleteFile(
    publicId: string,
    resourceType: 'image' | 'raw' | 'video' = 'image'
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new AppError('Cloudinary chưa được cấu hình (thiếu CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY hoặc CLOUDINARY_API_SECRET trong .env).', 503);
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      return result.result === 'ok';
    } catch (error: any) {
      console.error(`[CloudinaryService] Lỗi khi xóa file ${publicId}:`, error);
      throw new AppError(`Không thể xóa file trên Cloudinary: ${error.message}`, 500);
    }
  }

  /**
   * Helper thực thi upload từ Buffer, đường dẫn filePath (string) hoặc Multer File
   */
  private async executeUpload(
    file: string | Buffer | Express.Multer.File,
    uploadOptions: UploadApiOptions
  ): Promise<CloudinaryUploadResult> {
    if (!this.isConfigured()) {
      throw new AppError(
        'Cloudinary chưa được cấu hình. Vui lòng thêm CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET vào file .env',
        503
      );
    }

    try {
      let result: UploadApiResponse;

      if (typeof file === 'string') {
        // Upload từ đường dẫn file trên ổ cứng (local filePath)
        result = await cloudinary.uploader.upload(file, uploadOptions);
      } else if (Buffer.isBuffer(file)) {
        // Upload từ Buffer trong bộ nhớ
        result = await this.uploadFromStream(file, uploadOptions);
      } else if (file && typeof file === 'object') {
        // Express.Multer.File: có thể có file.path hoặc file.buffer
        if (file.path) {
          result = await cloudinary.uploader.upload(file.path, uploadOptions);
        } else if (file.buffer) {
          result = await this.uploadFromStream(file.buffer, uploadOptions);
        } else {
          throw new ValidationError('Dữ liệu file không hợp lệ (không tìm thấy path hoặc buffer)');
        }
      } else {
        throw new ValidationError('Tham số file không hợp lệ để upload lên Cloudinary');
      }

      return {
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        format: result.format || '',
        resourceType: result.resource_type as 'image' | 'raw' | 'video',
        bytes: result.bytes,
        originalFilename: result.original_filename,
        createdAt: result.created_at,
      };
    } catch (error: any) {
      console.error('[CloudinaryService] Upload thất bại:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Lỗi tải file lên Cloudinary: ${error.message || 'Lỗi không xác định'}`, 500);
    }
  }

  private uploadFromStream(buffer: Buffer, uploadOptions: UploadApiOptions): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Không nhận được kết quả upload từ Cloudinary'));
        }
        resolve(result);
      });

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }
}

export const cloudinaryService = new CloudinaryService();
