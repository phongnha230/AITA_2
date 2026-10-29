import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  storeAssignmentFiles,
  isRemoteUrl,
  resolveAssignmentFile,
  removeAssignmentFile,
} from '../../src/modules/assignment/infrastructure/storage/assignment-file.storage.js';
import { cloudinaryService } from '../../src/infrastructure/storage/cloudinary.service.js';

describe('assignment file storage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects path-like assignment ids before creating an upload directory', async () => {
    await expect(storeAssignmentFiles('../outside', {})).rejects.toMatchObject({
      statusCode: 400,
      errorCode: 'VALIDATION_FAILED',
    });
  });

  it('identifies remote urls correctly', () => {
    expect(isRemoteUrl('https://res.cloudinary.com/demo/raw/upload/test.pdf')).toBe(true);
    expect(isRemoteUrl('http://res.cloudinary.com/demo/raw/upload/test.pdf')).toBe(true);
    expect(isRemoteUrl('assignments/123/file.pdf')).toBe(false);
    expect(isRemoteUrl(null)).toBe(false);
    expect(isRemoteUrl(undefined)).toBe(false);
  });

  it('throws validation error when resolveAssignmentFile is called with remote url', () => {
    expect(() =>
      resolveAssignmentFile('https://res.cloudinary.com/test.pdf')
    ).toThrow('liên kết đám mây từ xa');
  });

  it('uploads to Cloudinary when configured', async () => {
    const validAssignmentId = '12345678-1234-4234-8234-123456789abc';
    vi.spyOn(cloudinaryService, 'isConfigured').mockReturnValue(true);
    const uploadPdfSpy = vi.spyOn(cloudinaryService, 'uploadPdf').mockResolvedValue({
      url: 'http://res.cloudinary.com/test.pdf',
      secureUrl: 'https://res.cloudinary.com/test.pdf',
      publicId: 'aita/assignments/test',
      format: 'pdf',
      resourceType: 'raw',
      bytes: 1024,
      createdAt: new Date().toISOString(),
    });

    const mockPdfFile = {
      buffer: Buffer.from('%PDF-1.4 mock content'),
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
    } as Express.Multer.File;

    const result = await storeAssignmentFiles(validAssignmentId, { pdf: mockPdfFile });

    expect(uploadPdfSpy).toHaveBeenCalled();
    expect(result.pdfFilePath).toBe('https://res.cloudinary.com/test.pdf');
  });

  it('deletes remote files using deleteByUrl', async () => {
    const deleteSpy = vi.spyOn(cloudinaryService, 'deleteByUrl').mockResolvedValue(true);
    const remoteUrl = 'https://res.cloudinary.com/demo/raw/upload/aita/assignments/abc/pdf-123.pdf';

    await removeAssignmentFile(remoteUrl);
    expect(deleteSpy).toHaveBeenCalledWith(remoteUrl, 'raw');
  });
});
