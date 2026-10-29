import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../../../infrastructure/config/env.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { cloudinaryService } from '../../../../infrastructure/storage/cloudinary.service.js';

export type AssignmentFileKind = 'pdf' | 'starter';

const uploadRoot = path.resolve(env.UPLOAD_DIR);

export const isRemoteUrl = (filePath?: string | null): boolean => {
  if (!filePath || typeof filePath !== 'string') return false;
  return filePath.startsWith('http://') || filePath.startsWith('https://');
};

export const storeAssignmentFiles = async (
  assignmentId: string,
  files: { pdf?: Express.Multer.File; starter?: Express.Multer.File }
): Promise<{ pdfFilePath?: string; starterCodePath?: string }> => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(assignmentId)) {
    throw new ValidationError('ID đề thi không hợp lệ.');
  }

  // 1. Kiểm tra tính hợp lệ của dữ liệu file trước khi lưu
  if (files.pdf) {
    if (!files.pdf.buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
      throw new ValidationError('Tệp PDF không hợp lệ.');
    }
  }
  if (files.starter) {
    const signature = files.starter.buffer.subarray(0, 4);
    const isZip = signature[0] === 0x50 && signature[1] === 0x4b && [0x03, 0x05, 0x07].includes(signature[2]) && [0x04, 0x06, 0x08].includes(signature[3]);
    if (!isZip) throw new ValidationError('Tệp starter code không phải ZIP hợp lệ.');
  }

  const savedPaths: string[] = [];
  const result: { pdfFilePath?: string; starterCodePath?: string } = {};

  try {
    // 2. Nếu Cloudinary đã được cấu hình -> Upload trực tiếp lên Cloudinary
    if (cloudinaryService.isConfigured()) {
      if (files.pdf) {
        const uploadRes = await cloudinaryService.uploadPdf(files.pdf, {
          folder: `aita/assignments/${assignmentId}`,
          publicId: `pdf-${crypto.randomUUID()}`,
        });
        savedPaths.push(uploadRes.secureUrl);
        result.pdfFilePath = uploadRes.secureUrl;
      }
      if (files.starter) {
        const uploadRes = await cloudinaryService.uploadZip(files.starter, {
          folder: `aita/assignments/${assignmentId}`,
          publicId: `starter-${crypto.randomUUID()}`,
        });
        savedPaths.push(uploadRes.secureUrl);
        result.starterCodePath = uploadRes.secureUrl;
      }
      return result;
    }

    // 3. Fallback: Lưu vào bộ nhớ cục bộ (Local Disk) khi chưa cấu hình Cloudinary (cho môi trường test/offline)
    const directory = path.join(uploadRoot, 'assignments', assignmentId);
    await fs.mkdir(directory, { recursive: true });

    if (files.pdf) {
      const relativePath = path.posix.join('assignments', assignmentId, `${crypto.randomUUID()}.pdf`);
      await fs.writeFile(path.join(uploadRoot, ...relativePath.split('/')), files.pdf.buffer, { flag: 'wx' });
      savedPaths.push(relativePath);
      result.pdfFilePath = relativePath;
    }
    if (files.starter) {
      const relativePath = path.posix.join('assignments', assignmentId, `${crypto.randomUUID()}.zip`);
      await fs.writeFile(path.join(uploadRoot, ...relativePath.split('/')), files.starter.buffer, { flag: 'wx' });
      savedPaths.push(relativePath);
      result.starterCodePath = relativePath;
    }
    return result;
  } catch (error) {
    await Promise.all(savedPaths.map((savedPath) => removeAssignmentFile(savedPath)));
    throw error;
  }
};

export const resolveAssignmentFile = (relativePath: string): string => {
  if (isRemoteUrl(relativePath)) {
    throw new ValidationError('Đường dẫn tệp là liên kết đám mây từ xa, không phải tệp cục bộ.');
  }
  const absolutePath = path.resolve(uploadRoot, relativePath);
  if (!absolutePath.startsWith(`${uploadRoot}${path.sep}`)) {
    throw new ValidationError('Đường dẫn tệp đề không hợp lệ.');
  }
  return absolutePath;
};

export const removeAssignmentFile = async (relativePathOrUrl?: string | null): Promise<void> => {
  if (!relativePathOrUrl) return;
  if (isRemoteUrl(relativePathOrUrl)) {
    await cloudinaryService.deleteByUrl(relativePathOrUrl, 'raw');
    return;
  }
  try {
    await fs.unlink(resolveAssignmentFile(relativePathOrUrl));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
};
