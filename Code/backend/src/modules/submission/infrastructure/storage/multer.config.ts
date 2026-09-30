import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { env } from '../../../../infrastructure/config/env.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

const ZIP_UPLOAD_DIR = path.resolve(env.UPLOAD_DIR, 'submissions-zip-tmp');
fs.mkdirSync(ZIP_UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ZIP_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const safeExt = path.extname(file.originalname).toLowerCase() === '.zip' ? '.zip' : '';
    cb(null, `upload-${uniqueSuffix}${safeExt}`);
  },
});

function zipFileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  const hasZipExtension = path.extname(file.originalname).toLowerCase() === '.zip';
  const hasZipMimeType = ALLOWED_MIME_TYPES.has(file.mimetype);

  if (!hasZipExtension || !hasZipMimeType) {
    cb(new ValidationError('Chỉ chấp nhận file nén .zip cho bài nộp'));
    return;
  }

  cb(null, true);
}

export const submissionZipUpload = multer({
  storage,
  fileFilter: zipFileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
});
