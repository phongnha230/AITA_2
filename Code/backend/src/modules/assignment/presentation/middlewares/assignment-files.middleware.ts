import multer, { FileFilterCallback } from 'multer';
import path from 'node:path';
import { Request } from 'express';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

const fileFilter = (_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (file.fieldname === 'pdf' && extension === '.pdf' && file.mimetype === 'application/pdf') {
    callback(null, true);
    return;
  }
  const zipMimeTypes = new Set(['application/zip', 'application/x-zip-compressed', 'application/octet-stream']);
  if (file.fieldname === 'starter' && extension === '.zip' && zipMimeTypes.has(file.mimetype)) {
    callback(null, true);
    return;
  }
  callback(new ValidationError('Chỉ nhận PDF cho trường pdf và ZIP cho trường starter.'));
};

export const assignmentFilesUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { files: 2, fileSize: 50 * 1024 * 1024, fields: 1, fieldSize: 2 * 1024 * 1024 },
}).fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'starter', maxCount: 1 },
]);
