import { NextFunction, Request, Response } from 'express';
import { cloudinaryService } from '../../infrastructure/storage/cloudinary.service.js';
import { sendSuccess } from '../../shared/presentation/utils/api-response.util.js';

export class UploadController {
  getStatus = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, { configured: cloudinaryService.isConfigured() });
    } catch (error) {
      next(error);
    }
  };
}

export const uploadController = new UploadController();
