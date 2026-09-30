import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu (Seeding Database)...');

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Tạo tài khoản Quản trị viên (Admin)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fpt.edu.vn' },
    update: {},
    create: {
      email: 'admin@fpt.edu.vn',
      fullName: 'System Administrator',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Tạo Admin:', admin.email);

  // 2. Tạo tài khoản Giảng viên (Lecturer)
  const lecturer = await prisma.user.upsert({
    where: { email: 'lecturer@fpt.edu.vn' },
    update: {},
    create: {
      email: 'lecturer@fpt.edu.vn',
      fullName: 'Dr. Nguyen Van Giang',
      passwordHash: defaultPasswordHash,
      role: 'LECTURER',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Tạo Lecturer:', lecturer.email);

  // 3. Tạo tài khoản Sinh viên (Student)
  const student = await prisma.user.upsert({
    where: { email: 'student@fpt.edu.vn' },
    update: {},
    create: {
      email: 'student@fpt.edu.vn',
      fullName: 'Tran Van Sinh Vien',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Tạo Student:', student.email);

  // 4. Tạo Khóa học mẫu (Course)
  const course = await prisma.course.upsert({
    where: {
      uk_course_code_semester: {
        code: 'CSD201_FA24',
        semester: 'Fall 2024',
      },
    },
    update: {},
    create: {
      code: 'CSD201_FA24',
      name: 'Data Structures and Algorithms',
      semester: 'Fall 2024',
      lecturerId: lecturer.id,
      isActive: true,
    },
  });
  console.log('✅ Tạo Course:', course.name, `(${course.code})`);

  console.log('🎉 Seeding hoàn tất thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
