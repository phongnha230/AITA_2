import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller.js';
import {
  uploadImageMiddleware,
  uploadPdfMiddleware,
  uploadZipMemoryMiddleware,
} from '../../infrastructure/storage/upload.middleware.js';
import { authenticateJWT } from '../../modules/auth/presentation/middlewares/auth.middleware.js';

const router = Router();

// 1. Kiểm tra trạng thái cấu hình Cloudinary (Public hoặc Auth)
router.get('/status', uploadController.getStatus);

// 2. Upload Ảnh (Avatar, đề bài, tài liệu) - Cần đăng nhập
router.post(
  '/image',
  authenticateJWT,
  uploadImageMiddleware.single('file'),
  uploadController.uploadImage
);

// 3. Upload Tài liệu PDF (Đề bài, tài liệu môn học) - Cần đăng nhập
router.post(
  '/pdf',
  authenticateJWT,
  uploadPdfMiddleware.single('file'),
  uploadController.uploadPdf
);

// 4. Upload File ZIP (Source code bài nộp, file nén) - Cần đăng nhập
router.post(
  '/zip',
  authenticateJWT,
  uploadZipMemoryMiddleware.single('file'),
  uploadController.uploadZip
);

// 5. Xóa file trên Cloudinary - Cần đăng nhập
router.delete(
  '/',
  authenticateJWT,
  uploadController.deleteFile
);

export default router;
