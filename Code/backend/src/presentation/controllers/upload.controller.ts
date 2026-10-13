import { Request, Response, NextFunction } from 'express';
import { cloudinaryService } from '../../infrastructure/storage/cloudinary.service.js';
import { sendSuccess } from '../../shared/presentation/utils/api-response.util.js';
import { ValidationError, AppError } from '../../shared/domain/exceptions/app.error.js';

export class UploadController {
  /**
   * Kiểm tra trạng thái tích hợp Cloudinary
   */
  getStatus = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isConfigured = cloudinaryService.isConfigured();
      sendSuccess(res, {
        service: 'Cloudinary',
        configured: isConfigured,
        supportedTypes: ['image', 'pdf', 'zip', 'raw'],
        message: isConfigured
          ? 'Cloudinary đã được cấu hình và sẵn sàng hoạt động.'
          : 'Cloudinary chưa được cấu hình các biến môi trường trong .env.',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload hình ảnh (Avatar, ảnh tài liệu, ảnh đề bài)
   */
  uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new ValidationError('Vui lòng chọn một file hình ảnh để upload (trường "file")');
      }

      const folder = (req.body.folder || req.query.folder || 'aita/images') as string;
      const result = await cloudinaryService.uploadImage(req.file, { folder });

      sendSuccess(
        res,
        {
          url: result.secureUrl,
          secureUrl: result.secureUrl,
          publicId: result.publicId,
          format: result.format,
          bytes: result.bytes,
          resourceType: result.resourceType,
        },
        'Upload hình ảnh lên Cloudinary thành công.',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload tài liệu PDF (Đề bài, hướng dẫn, tài liệu môn học)
   */
  uploadPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new ValidationError('Vui lòng chọn một file tài liệu PDF để upload (trường "file")');
      }

      const folder = (req.body.folder || req.query.folder || 'aita/documents') as string;
      const result = await cloudinaryService.uploadPdf(req.file, { folder });

      sendSuccess(
        res,
        {
          url: result.secureUrl,
          secureUrl: result.secureUrl,
          publicId: result.publicId,
          format: result.format,
          bytes: result.bytes,
          resourceType: result.resourceType,
          originalFilename: req.file.originalname,
        },
        'Upload tài liệu PDF lên Cloudinary thành công.',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload file ZIP (Source code, tài liệu nén)
   */
  uploadZip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new ValidationError('Vui lòng chọn một file ZIP để upload (trường "file")');
      }

      const folder = (req.body.folder || req.query.folder || 'aita/submissions') as string;
      const result = await cloudinaryService.uploadZip(req.file, { folder });

      sendSuccess(
        res,
        {
          url: result.secureUrl,
          secureUrl: result.secureUrl,
          publicId: result.publicId,
          format: result.format,
          bytes: result.bytes,
          resourceType: result.resourceType,
          originalFilename: req.file.originalname,
        },
        'Upload file ZIP lên Cloudinary thành công.',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Xóa file khỏi Cloudinary
   */
  deleteFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { publicId, resourceType } = req.body;
      if (!publicId) {
        throw new ValidationError('publicId là bắt buộc để xóa file');
      }

      const deleted = await cloudinaryService.deleteFile(publicId, resourceType || 'image');

      if (!deleted) {
        throw new AppError('Không thể xóa file hoặc file không tồn tại', 400);
      }

      sendSuccess(res, { publicId, deleted: true }, 'Đã xóa file trên Cloudinary thành công.');
    } catch (error) {
      next(error);
    }
  };
}

export const uploadController = new UploadController();
