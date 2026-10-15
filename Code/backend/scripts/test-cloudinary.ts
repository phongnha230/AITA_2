import AdmZip from 'adm-zip';
import { cloudinaryService } from '../src/infrastructure/storage/cloudinary.service.js';
import { env } from '../src/infrastructure/config/env.js';

async function runTest() {
  console.log('====================================================');
  console.log('🚀 KIỂM TRA TÍCH HỢP CLOUDINARY CHO HỆ THỐNG AITA');
  console.log('====================================================');
  console.log(`Cloud Name : ${env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`API Key    : ${env.CLOUDINARY_API_KEY ? '******' + env.CLOUDINARY_API_KEY.slice(-4) : 'CHƯA CÓ'}`);
  console.log(`Configured : ${cloudinaryService.isConfigured() ? '✅ YES' : '❌ NO'}`);
  console.log('----------------------------------------------------');

  if (!cloudinaryService.isConfigured()) {
    console.error('❌ Cloudinary chưa được cấu hình đầy đủ trong file .env');
    process.exit(1);
  }

  const createdPublicIds: { id: string; type: 'image' | 'raw' }[] = [];

  try {
    // 1. TEST UPLOAD HÌNH ẢNH (IMAGE)
    console.log('\n[1/3] 📸 Đang kiểm tra upload Hình ảnh (1x1 PNG)...');
    // 1x1 transparent PNG buffer
    const dummyPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );
    const imgResult = await cloudinaryService.uploadImage(dummyPngBuffer, {
      folder: 'aita/test',
      publicId: `test-img-${Date.now()}`,
    });
    console.log('   ✅ Upload ảnh thành công!');
    console.log(`   - URL       : ${imgResult.secureUrl}`);
    console.log(`   - Public ID : ${imgResult.publicId}`);
    console.log(`   - Định dạng : ${imgResult.format} (${imgResult.bytes} bytes)`);
    createdPublicIds.push({ id: imgResult.publicId, type: 'image' });

    // 2. TEST UPLOAD TÀI LIỆU PDF
    console.log('\n[2/3] 📄 Đang kiểm tra upload Tài liệu PDF...');
    const dummyPdfBuffer = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\n%%EOF'
    );
    const pdfResult = await cloudinaryService.uploadPdf(dummyPdfBuffer, {
      folder: 'aita/test',
      publicId: `test-doc-${Date.now()}.pdf`,
    });
    console.log('   ✅ Upload tài liệu PDF thành công!');
    console.log(`   - URL       : ${pdfResult.secureUrl}`);
    console.log(`   - Public ID : ${pdfResult.publicId}`);
    console.log(`   - Dung lượng: ${pdfResult.bytes} bytes`);
    createdPublicIds.push({ id: pdfResult.publicId, type: 'raw' });

    // 3. TEST UPLOAD FILE ZIP (SOURCE CODE NỘP BÀI)
    console.log('\n[3/3] 📦 Đang kiểm tra upload File ZIP nộp bài (Resource Raw)...');
    const zip = new AdmZip();
    zip.addFile('main.c', Buffer.from('#include <stdio.h>\nint main() { printf("Hello Cloudinary!\\n"); return 0; }'));
    const zipBuffer = zip.toBuffer();

    const zipResult = await cloudinaryService.uploadZip(zipBuffer, {
      folder: 'aita/test',
      publicId: `test-submission-${Date.now()}.zip`,
    });
    console.log('   ✅ Upload file ZIP thành công!');
    console.log(`   - URL       : ${zipResult.secureUrl}`);
    console.log(`   - Public ID : ${zipResult.publicId}`);
    console.log(`   - Dung lượng: ${zipResult.bytes} bytes`);
    createdPublicIds.push({ id: zipResult.publicId, type: 'raw' });

    // 4. TEST DỌN DẸP / XÓA FILE TEST
    console.log('\n[Dọn dẹp] 🧹 Đang dọn dẹp các file test trên Cloudinary...');
    for (const item of createdPublicIds) {
      await cloudinaryService.deleteFile(item.id, item.type);
      console.log(`   - Đã xóa: ${item.id} (${item.type})`);
    }

    console.log('\n====================================================');
    console.log('🎉 TẤT CẢ CÁC KIỂM TRA ĐỀU THÀNH CÔNG 100%!');
    console.log('Cloudinary đã sẵn sàng lưu trữ Ảnh, PDF và File ZIP.');
    console.log('====================================================');
  } catch (error: any) {
    console.error('\n❌ GẶP LỖI TRONG QUÁ TRÌNH TEST:');
    console.error(error.message || error);
    process.exit(1);
  }
}

runTest();
