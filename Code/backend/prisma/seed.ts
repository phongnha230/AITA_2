import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu (Seeding Database)...');

  const defaultPassword = 'password123';
  const defaultPasswordHash = await bcrypt.hash(defaultPassword, 10);

  // 1. Tạo tài khoản Quản trị viên (Admin)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fpt.edu.vn' },
    update: {
      fullName: 'System Administrator',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      email: 'admin@fpt.edu.vn',
      fullName: 'System Administrator',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ [ADMIN]    Email: ${admin.email} | Password: ${defaultPassword}`);

  // 2. Tạo tài khoản Giảng viên (Lecturer)
  const lecturer = await prisma.user.upsert({
    where: { email: 'lecturer@fpt.edu.vn' },
    update: {
      fullName: 'Dr. Nguyen Van Giang',
      passwordHash: defaultPasswordHash,
      role: 'LECTURER',
      status: 'ACTIVE',
    },
    create: {
      email: 'lecturer@fpt.edu.vn',
      fullName: 'Dr. Nguyen Van Giang',
      passwordHash: defaultPasswordHash,
      role: 'LECTURER',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ [LECTURER] Email: ${lecturer.email} | Password: ${defaultPassword}`);

  // 3. Tạo tài khoản Sinh viên / User (Student)
  const student = await prisma.user.upsert({
    where: { email: 'student@fpt.edu.vn' },
    update: {
      fullName: 'Tran Van Sinh Vien',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
    },
    create: {
      email: 'student@fpt.edu.vn',
      fullName: 'Tran Van Sinh Vien',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ [STUDENT]  Email: ${student.email} | Password: ${defaultPassword}`);

  const user = await prisma.user.upsert({
    where: { email: 'user@fpt.edu.vn' },
    update: {
      fullName: 'Standard User',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
    },
    create: {
      email: 'user@fpt.edu.vn',
      fullName: 'Standard User',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ [USER]     Email: ${user.email} | Password: ${defaultPassword}`);

  // 4. Tạo Khóa học mẫu (Course)
  const course = await prisma.course.upsert({
    where: {
      uk_course_code_semester: {
        code: 'CSD201_FA24',
        semester: 'Fall 2024',
      },
    },
    update: {
      enrollmentCode: 'CSD201_FA24',
      codeExpiresAt: new Date('2027-01-01T00:00:00.000Z'),
      name: 'Data Structures and Algorithms',
      lecturerId: lecturer.id,
      isActive: true,
    },
    create: {
      code: 'CSD201_FA24',
      name: 'Data Structures and Algorithms',
      semester: 'Fall 2024',
      lecturerId: lecturer.id,
      isActive: true,
      enrollmentCode: 'CSD201_FA24',
      codeExpiresAt: new Date('2027-01-01T00:00:00.000Z'),
    },
  });
  console.log('✅ Tạo Course:', course.name, `(${course.code}) | Invite Code: ${course.enrollmentCode}`);

  // 5. Tạo Đề thi PE mẫu thuộc khóa học
  const now = new Date();
  const startTime = new Date(now.getTime() - 60 * 60 * 1000); // 1 giờ trước -> trạng thái OPEN
  const deadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 ngày sau

  const assignment = await prisma.assignment.upsert({
    where: { id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' },
    update: {
      courseId: course.id,
      title: 'CSD201 PE - Binary Search Tree & AVL',
      description: 'Kỳ thi thực hành Practical Exam môn CSD201: Cài đặt Cây nhị phân tìm kiếm và cân bằng AVL.',
      environment: 'JAVA_JDK',
      submissionType: 'INDIVIDUAL',
      startTime,
      deadline,
      status: 'PUBLISHED',
    },
    create: {
      id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      courseId: course.id,
      title: 'CSD201 PE - Binary Search Tree & AVL',
      description: 'Kỳ thi thực hành Practical Exam môn CSD201: Cài đặt Cây nhị phân tìm kiếm và cân bằng AVL.',
      environment: 'JAVA_JDK',
      submissionType: 'INDIVIDUAL',
      startTime,
      deadline,
      status: 'PUBLISHED',
      createdBy: lecturer.id,
    },
  });
  console.log('✅ Tạo PE Assignment:', assignment.title, `(${assignment.status})`);
  console.log(`✅ [COURSE]   Code: ${course.code} | Name: ${course.name}`);

  // 5. Gán học sinh vào khóa học (Enrollment)
  await prisma.courseEnrollment.upsert({
    where: {
      uk_enrollment_course_student: {
        courseId: course.id,
        studentId: student.id,
      },
    },
    update: {},
    create: {
      courseId: course.id,
      studentId: student.id,
      groupLabel: 'SE1801',
    },
  });

  await prisma.courseEnrollment.upsert({
    where: {
      uk_enrollment_course_student: {
        courseId: course.id,
        studentId: user.id,
      },
    },
    update: {},
    create: {
      courseId: course.id,
      studentId: user.id,
      groupLabel: 'SE1801',
    },
  });
  console.log(`✅ [ENROLL]   Enrolled students to course ${course.code}`);

  console.log('\n🎉 Seeding hoàn tất thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
