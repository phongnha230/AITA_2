import multer, { FileFilterCallback } from 'multer';
import path from 'node:path';
import { Request } from 'express';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

const pdfMimeTypes = new Set([
  'application/pdf',
  'application/x-pdf',
  'application/acrobat',
  'applications/vnd.pdf',
  'text/pdf',
  'application/octet-stream',
]);

const zipMimeTypes = new Set([
  'application/zip',
  'application/x-zip-compressed',
  'application/x-zip',
  'multipart/x-zip',
  'application/octet-stream',
]);

const fileFilter = (_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (file.fieldname === 'pdf' && extension === '.pdf' && (pdfMimeTypes.has(file.mimetype) || file.mimetype.includes('pdf'))) {
    callback(null, true);
    return;
  }
  if (file.fieldname === 'starter' && extension === '.zip' && (zipMimeTypes.has(file.mimetype) || file.mimetype.includes('zip'))) {
    callback(null, true);
    return;
  }
  callback(new ValidationError('Chỉ nhận PDF cho trường pdf và ZIP cho trường starter.'));
};

export const assignmentFilesUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { files: 2, fileSize: 50 * 1024 * 1024, fields: 10, fieldSize: 10 * 1024 * 1024 },
}).fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'starter', maxCount: 1 },
]);
