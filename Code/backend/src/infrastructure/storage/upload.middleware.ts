import multer, { FileFilterCallback } from 'multer';
import path from 'node:path';
import { Request } from 'express';
import { ValidationError } from '../../shared/domain/exceptions/app.error.js';
import { env } from '../config/env.js';

// 1. Cho phép ảnh: jpg, jpeg, png, webp, gif, svg
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Chỉ chấp nhận file hình ảnh định dạng JPG, PNG, WEBP, GIF, SVG'));
  }
};

// 2. Cho phép tài liệu PDF
const ALLOWED_PDF_MIME_TYPES = new Set([
  'application/pdf',
]);

const pdfFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';
  if (isPdfExt && ALLOWED_PDF_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Chỉ chấp nhận tài liệu định dạng .pdf'));
  }
};

// 3. Cho phép file nén ZIP
const ALLOWED_ZIP_MIME_TYPES = new Set([
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
]);

const zipFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const isZipExt = path.extname(file.originalname).toLowerCase() === '.zip';
  if (isZipExt || ALLOWED_ZIP_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Chỉ chấp nhận file nén định dạng .zip'));
  }
};

// Bộ nhớ đệm MemoryStorage: upload trực tiếp lên Cloudinary mà không tốn ghi đọc đĩa
const memoryStorage = multer.memoryStorage();

// Middleware upload ảnh (tối đa 10MB)
export const uploadImageMiddleware = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

// Middleware upload PDF (tối đa 25MB)
export const uploadPdfMiddleware = multer({
  storage: memoryStorage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 1,
  },
});

// Middleware upload ZIP (dùng memory storage hoặc tối đa dung lượng cấu hình)
export const uploadZipMemoryMiddleware = multer({
  storage: memoryStorage,
  fileFilter: zipFileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
});
