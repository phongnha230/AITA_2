import fs from 'node:fs/promises';
import prisma from '../src/infrastructure/database/prisma.client.js';
import { cloudinaryService } from '../src/infrastructure/storage/cloudinary.service.js';
import { isRemoteUrl, resolveAssignmentFile } from '../src/modules/assignment/infrastructure/storage/assignment-file.storage.js';

async function migrateAssignmentsToCloud(): Promise<void> {
  console.log('--- BẮT ĐẦU QUÁ TRÌNH DI CHUYỂN FILE ĐỀ THI LÊN CLOUDINARY ---');

  if (!cloudinaryService.isConfigured()) {
    console.error('LỖI: Cloudinary chưa được cấu hình trong file .env. Vui lòng kiểm tra CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
    process.exit(1);
  }

  const assignments = await prisma.assignment.findMany({
    select: {
      id: true,
      title: true,
      pdfFilePath: true,
      starterCodePath: true,
    },
  });

  console.log(`Tìm thấy tổng cộng ${assignments.length} đề thi trong cơ sở dữ liệu.`);

  let migratedPdfCount = 0;
  let migratedStarterCount = 0;
  let missingFileCount = 0;

  for (const assignment of assignments) {
    let newPdfUrl = assignment.pdfFilePath;
    let newStarterUrl = assignment.starterCodePath;
    let hasChanges = false;

    // 1. Migrate PDF
    if (assignment.pdfFilePath && !isRemoteUrl(assignment.pdfFilePath)) {
      try {
        const localPath = resolveAssignmentFile(assignment.pdfFilePath);
        await fs.access(localPath);
        console.log(`[${assignment.title}] Đang upload PDF local (${assignment.pdfFilePath}) lên Cloudinary...`);
        const fileBuffer = await fs.readFile(localPath);
        const uploadResult = await cloudinaryService.uploadPdf(fileBuffer, {
          folder: `aita/assignments/${assignment.id}`,
          publicId: `pdf-migrated-${Date.now()}`,
        });
        newPdfUrl = uploadResult.secureUrl;
        hasChanges = true;
        migratedPdfCount++;
        console.log(` -> Thành công: ${newPdfUrl}`);
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          console.warn(`[${assignment.title}] PDF không tồn tại trên máy local này (${assignment.pdfFilePath}). Bỏ qua.`);
          missingFileCount++;
        } else {
          console.error(`[${assignment.title}] Lỗi upload PDF:`, err);
        }
      }
    }

    // 2. Migrate Starter ZIP
    if (assignment.starterCodePath && !isRemoteUrl(assignment.starterCodePath)) {
      try {
        const localPath = resolveAssignmentFile(assignment.starterCodePath);
        await fs.access(localPath);
        console.log(`[${assignment.title}] Đang upload Starter ZIP local (${assignment.starterCodePath}) lên Cloudinary...`);
        const fileBuffer = await fs.readFile(localPath);
        const uploadResult = await cloudinaryService.uploadZip(fileBuffer, {
          folder: `aita/assignments/${assignment.id}`,
          publicId: `starter-migrated-${Date.now()}`,
        });
        newStarterUrl = uploadResult.secureUrl;
        hasChanges = true;
        migratedStarterCount++;
        console.log(` -> Thành công: ${newStarterUrl}`);
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          console.warn(`[${assignment.title}] Starter ZIP không tồn tại trên máy local này (${assignment.starterCodePath}). Bỏ qua.`);
          missingFileCount++;
        } else {
          console.error(`[${assignment.title}] Lỗi upload Starter ZIP:`, err);
        }
      }
    }

    // Cập nhật database nếu có file được chuyển đổi
    if (hasChanges) {
      await prisma.assignment.update({
        where: { id: assignment.id },
        data: {
          pdfFilePath: newPdfUrl,
          starterCodePath: newStarterUrl,
        },
      });
      console.log(`[${assignment.title}] Đã cập nhật Database thành công!`);
    }
  }

  console.log('\n--- KẾT QUẢ DI CHUYỂN ---');
  console.log(`- Đã upload thành công ${migratedPdfCount} file PDF lên Cloudinary.`);
  console.log(`- Đã upload thành công ${migratedStarterCount} file Starter ZIP lên Cloudinary.`);
  console.log(`- Số lượng file không tìm thấy trên máy local này: ${missingFileCount}.`);
  console.log('Quá trình hoàn tất.');
}

migrateAssignmentsToCloud()
  .catch((err) => {
    console.error('Lỗi nghiêm trọng khi chạy migration:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
