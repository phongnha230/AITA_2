import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu phong phú cho toàn hệ thống AITA...');

  const defaultPassword = 'password123';
  const defaultPasswordHash = await bcrypt.hash(defaultPassword, 10);

  // 1. TÀI KHOẢN NGƯỜI DÙNG (ADMINS, LECTURERS, STUDENTS)
  const usersData = [
    // Admins
    {
      email: 'admin@fpt.edu.vn',
      fullName: 'System Administrator',
      role: 'ADMIN' as const,
      status: 'ACTIVE' as const,
      studentCode: 'ADM_001',
      major: 'Quản trị hệ thống',
      cohort: 'K17',
    },
    {
      email: 'khangtd.admin@fpt.edu.vn',
      fullName: 'Trần Đình Khang',
      role: 'ADMIN' as const,
      status: 'ACTIVE' as const,
      studentCode: 'ADM_ROOT',
      major: 'Hạ tầng khảo thí',
      cohort: 'K16',
    },
    // Lecturers
    {
      email: 'lecturer@fpt.edu.vn',
      fullName: 'Dr. Nguyen Van Giang',
      role: 'LECTURER' as const,
      status: 'ACTIVE' as const,
      studentCode: 'FE00101',
      major: 'Kỹ thuật phần mềm',
      cohort: 'Bộ môn KTPM',
    },
    {
      email: 'namh@fpt.edu.vn',
      fullName: 'Thầy Hoàng Nam',
      role: 'LECTURER' as const,
      status: 'ACTIVE' as const,
      studentCode: 'FE00824',
      major: 'Kỹ thuật phần mềm',
      cohort: 'Bộ môn KTPM',
    },
    {
      email: 'lannm@fpt.edu.vn',
      fullName: 'Cô Nguyễn Mai Lan',
      role: 'LECTURER' as const,
      status: 'ACTIVE' as const,
      studentCode: 'FE00912',
      major: 'An toàn thông tin',
      cohort: 'Bộ môn ATTT',
    },
    {
      email: 'tuanhq@fpt.edu.vn',
      fullName: 'Thầy Huỳnh Quốc Tuấn',
      role: 'LECTURER' as const,
      status: 'ACTIVE' as const,
      studentCode: 'FE01045',
      major: 'Trí tuệ nhân tạo',
      cohort: 'Bộ môn AI',
    },
    // Students
    {
      email: 'student@fpt.edu.vn',
      fullName: 'Trần Đỗ Phong Nhã',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
      studentCode: 'QE190161',
      major: 'Kỹ thuật phần mềm',
      cohort: 'K19',
    },
    {
      email: 'annvhe172450@fpt.edu.vn',
      fullName: 'Nguyễn Văn An',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
      studentCode: 'HE172450',
      major: 'Công nghệ thông tin',
      cohort: 'K17',
    },
    {
      email: 'maittse174920@fpt.edu.vn',
      fullName: 'Trần Thị Mai',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
      studentCode: 'SE174920',
      major: 'Kỹ thuật phần mềm',
      cohort: 'K17',
    },
    {
      email: 'diepnhe180203@fpt.edu.vn',
      fullName: 'Nguyễn Văn Điệp',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
      studentCode: 'QE180203',
      major: 'An toàn thông tin',
      cohort: 'K18',
    },
    {
      email: 'tuannaqe190003@fpt.edu.vn',
      fullName: 'Nguyễn Anh Tuấn',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
      studentCode: 'QE190003',
      major: 'Kỹ thuật phần mềm',
      cohort: 'K19',
    },
    {
      email: 'longthqe190045@fpt.edu.vn',
      fullName: 'Lê Hoàng Long',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
      studentCode: 'QE190045',
      major: 'Trí tuệ nhân tạo',
      cohort: 'K19',
    },
    {
      email: 'minhlqhe180015@fpt.edu.vn',
      fullName: 'Lê Quang Minh',
      role: 'STUDENT' as const,
      status: 'SUSPENDED' as const,
      studentCode: 'HE180015',
      major: 'Kỹ thuật phần mềm',
      cohort: 'K18',
    },
    {
      email: 'user@fpt.edu.vn',
      fullName: 'Standard User',
      role: 'STUDENT' as const,
      status: 'ACTIVE' as const,
      studentCode: 'QE190999',
      major: 'Kỹ thuật phần mềm',
      cohort: 'K19',
    },
  ];

  const createdUsers: Record<string, any> = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        role: u.role,
        status: u.status,
        studentCode: u.studentCode,
        major: u.major,
        cohort: u.cohort,
      },
      create: {
        email: u.email,
        fullName: u.fullName,
        passwordHash: defaultPasswordHash,
        role: u.role,
        status: u.status,
        studentCode: u.studentCode,
        major: u.major,
        cohort: u.cohort,
      },
    });
    createdUsers[u.email] = user;
  }
  console.log(`✅ Đã tạo/cập nhật ${Object.keys(createdUsers).length} tài khoản người dùng.`);

  // 2. KHÓA HỌC (COURSES)
  const coursesData = [
    {
      code: 'PRF192_FA24',
      name: 'C Programming Fundamentals',
      semester: 'Fall 2024',
      lecturerId: createdUsers['namh@fpt.edu.vn'].id,
      enrollmentCode: 'PRF192',
      isActive: true,
    },
    {
      code: 'CSD201_FA24',
      name: 'Data Structures and Algorithms',
      semester: 'Fall 2024',
      lecturerId: createdUsers['lannm@fpt.edu.vn'].id,
      enrollmentCode: 'CSD201',
      isActive: true,
    },
    {
      code: 'PRO192_FA24',
      name: 'Object-Oriented Programming (Java)',
      semester: 'Fall 2024',
      lecturerId: createdUsers['tuanhq@fpt.edu.vn'].id,
      enrollmentCode: 'PRO192',
      isActive: true,
    },
    {
      code: 'SWD392_FA24',
      name: 'Software Architecture and Design',
      semester: 'Fall 2024',
      lecturerId: createdUsers['lecturer@fpt.edu.vn'].id,
      enrollmentCode: 'SWD392',
      isActive: true,
    },
  ];

  const createdCourses: Record<string, any> = {};
  for (const c of coursesData) {
    const course = await prisma.course.upsert({
      where: {
        uk_course_code_semester: {
          code: c.code,
          semester: c.semester,
        },
      },
      update: {
        name: c.name,
        lecturerId: c.lecturerId,
        isActive: c.isActive,
        enrollmentCode: c.enrollmentCode,
      },
      create: c,
    });
    createdCourses[c.code] = course;
  }
  console.log(`✅ Đã tạo/cập nhật ${Object.keys(createdCourses).length} khóa học.`);

  // 3. GHI DANH SINH VIÊN VÀO KHÓA HỌC (ENROLLMENTS)
  const studentEmails = [
    'student@fpt.edu.vn',
    'annvhe172450@fpt.edu.vn',
    'maittse174920@fpt.edu.vn',
    'diepnhe180203@fpt.edu.vn',
    'tuannaqe190003@fpt.edu.vn',
    'longthqe190045@fpt.edu.vn',
    'user@fpt.edu.vn',
  ];

  for (const courseCode of Object.keys(createdCourses)) {
    const course = createdCourses[courseCode];
    for (const email of studentEmails) {
      const studentUser = createdUsers[email];
      if (studentUser) {
        await prisma.courseEnrollment.upsert({
          where: {
            uk_enrollment_course_student: {
              courseId: course.id,
              studentId: studentUser.id,
            },
          },
          update: {},
          create: {
            courseId: course.id,
            studentId: studentUser.id,
            groupLabel: 'SE19C',
          },
        });
      }
    }
  }
  console.log('✅ Đã ghi danh sinh viên vào các khóa học.');

  // 4. KHO KHÓA AI API KEYS
  const keysData = [
    {
      provider: 'GEMINI' as const,
      keyAlias: 'Key-01: Google Gemini 1.5 Pro (Primary)',
      keyHint: '7e1U',
      encryptedSecret: 'ENC_GEMINI_15_PRO_SECRET_KEY_MOCK',
      iv: 'a1b2c3d4e5f6g7h8',
      authTag: 'auth_tag_mock_1',
      dailyRequestLimit: 5000,
      currentRequestsToday: 1420,
      rpmLimit: 60,
      consecutiveFailures: 0,
      isActive: true,
    },
    {
      provider: 'OPENAI' as const,
      keyAlias: 'Key-02: OpenAI GPT-4o Mini (Rubric Engine)',
      keyHint: 'a8K1',
      encryptedSecret: 'ENC_OPENAI_GPT4O_SECRET_KEY_MOCK',
      iv: 'b2c3d4e5f6g7h8i9',
      authTag: 'auth_tag_mock_2',
      dailyRequestLimit: 3000,
      currentRequestsToday: 890,
      rpmLimit: 40,
      consecutiveFailures: 0,
      isActive: true,
    },
    {
      provider: 'GEMINI' as const,
      keyAlias: 'Key-03: Gemini 1.5 Flash (Socratic Tutor Pool)',
      keyHint: '9x4F',
      encryptedSecret: 'ENC_GEMINI_FLASH_SECRET_KEY_MOCK',
      iv: 'c3d4e5f6g7h8i9j0',
      authTag: 'auth_tag_mock_3',
      dailyRequestLimit: 10000,
      currentRequestsToday: 3250,
      rpmLimit: 120,
      consecutiveFailures: 0,
      isActive: true,
    },
    {
      provider: 'OPENAI' as const,
      keyAlias: 'Key-04: OpenAI GPT-4o Fallback Pool',
      keyHint: 'd11A',
      encryptedSecret: 'ENC_OPENAI_FALLBACK_SECRET_KEY_MOCK',
      iv: 'd4e5f6g7h8i9j0k1',
      authTag: 'auth_tag_mock_4',
      dailyRequestLimit: 1500,
      currentRequestsToday: 120,
      rpmLimit: 20,
      consecutiveFailures: 0,
      isActive: false,
    },
  ];

  for (const k of keysData) {
    const existing = await prisma.aiApiKey.findFirst({ where: { keyAlias: k.keyAlias } });
    if (!existing) {
      await prisma.aiApiKey.create({ data: k });
    }
  }
  console.log('✅ Đã tạo kho khóa AI API Keys.');

  // 5. ĐỀ THI / BÀI TẬP (ASSIGNMENTS)
  const now = new Date();
  const assignmentsData = [
    {
      courseId: createdCourses['PRF192_FA24'].id,
      title: 'PE Practical Exam - Lập trình C & Con trỏ mảng',
      description: 'Đề thi thực hành môn PRF192: Con trỏ, mảng 2 chiều và quản lý bộ nhớ động heap.',
      deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      createdBy: createdUsers['namh@fpt.edu.vn'].id,
      environment: 'C_GCC' as const,
      status: 'PUBLISHED' as const,
      durationMinutes: 90,
      accessCode: 'PE_PRF192',
    },
    {
      courseId: createdCourses['CSD201_FA24'].id,
      title: 'PE Practical Exam - Cấu trúc dữ liệu Cây nhị phân & AVL',
      description: 'Đề thi thực hành CSD201: Cài đặt cây AVL, duyệt theo thứ tự in-order và cân bằng xoay.',
      deadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      startTime: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      createdBy: createdUsers['lannm@fpt.edu.vn'].id,
      environment: 'JAVA_JDK' as const,
      status: 'PUBLISHED' as const,
      durationMinutes: 90,
      accessCode: 'PE_CSD201',
    },
    {
      courseId: createdCourses['PRO192_FA24'].id,
      title: 'Kiểm tra thực hành PRO192 - Đa hình & Kế thừa Java OOP',
      description: 'Xây dựng hệ thống quản lý nhân viên sử dụng Abstract Class, Interface và Polymorphism.',
      deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      startTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      createdBy: createdUsers['tuanhq@fpt.edu.vn'].id,
      environment: 'JAVA_JDK' as const,
      status: 'PUBLISHED' as const,
      durationMinutes: 75,
      accessCode: 'PE_PRO192',
    },
    {
      courseId: createdCourses['SWD392_FA24'].id,
      title: 'Final Project - Thiết kế Kiến trúc Clean Architecture API',
      description: 'Xây dựng hệ thống backend tuân thủ Domain-Driven Design, Repository Pattern và JWT.',
      deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      createdBy: createdUsers['lecturer@fpt.edu.vn'].id,
      environment: 'NODE_JS' as const,
      status: 'PUBLISHED' as const,
      durationMinutes: 120,
      accessCode: 'PE_SWD392',
    },
  ];

  const createdAssignments: any[] = [];
  for (const a of assignmentsData) {
    const existing = await prisma.assignment.findFirst({
      where: { courseId: a.courseId, title: a.title },
    });
    if (existing) {
      createdAssignments.push(existing);
    } else {
      const created = await prisma.assignment.create({ data: a });
      createdAssignments.push(created);
    }
  }
  console.log(`✅ Đã tạo ${createdAssignments.length} đề thi/bài tập.`);

  // 6. BÀI NỘP VÀ GRADING JOBS (SUBMISSIONS & JOBS)
  const sampleSubmissions = [
    {
      assignment: createdAssignments[0],
      user: createdUsers['student@fpt.edu.vn'],
      paperCode: 'DE_01',
      status: 'GRADED' as const,
      sandboxScore: 8.0,
      aiScore: 1.8,
      finalScore: 9.8,
      jobStatus: 'COMPLETED' as const,
    },
    {
      assignment: createdAssignments[0],
      user: createdUsers['annvhe172450@fpt.edu.vn'],
      paperCode: 'DE_01',
      status: 'GRADED' as const,
      sandboxScore: 6.5,
      aiScore: 1.5,
      finalScore: 8.0,
      jobStatus: 'COMPLETED' as const,
    },
    {
      assignment: createdAssignments[1],
      user: createdUsers['maittse174920@fpt.edu.vn'],
      paperCode: 'DE_02',
      status: 'GRADED' as const,
      sandboxScore: 7.5,
      aiScore: 1.7,
      finalScore: 9.2,
      jobStatus: 'COMPLETED' as const,
    },
    {
      assignment: createdAssignments[1],
      user: createdUsers['diepnhe180203@fpt.edu.vn'],
      paperCode: 'DE_02',
      status: 'RUNNING_SANDBOX' as const,
      sandboxScore: null,
      aiScore: null,
      finalScore: null,
      jobStatus: 'RUNNING_SANDBOX' as const,
    },
    {
      assignment: createdAssignments[2],
      user: createdUsers['tuannaqe190003@fpt.edu.vn'],
      paperCode: 'DE_03',
      status: 'RUNNING_AI' as const,
      sandboxScore: 7.0,
      aiScore: null,
      finalScore: null,
      jobStatus: 'RUNNING_AI' as const,
    },
    {
      assignment: createdAssignments[2],
      user: createdUsers['longthqe190045@fpt.edu.vn'],
      paperCode: 'DE_03',
      status: 'QUEUED' as const,
      sandboxScore: null,
      aiScore: null,
      finalScore: null,
      jobStatus: 'QUEUED' as const,
    },
    {
      assignment: createdAssignments[3],
      user: createdUsers['student@fpt.edu.vn'],
      paperCode: 'DE_04',
      status: 'FAILED' as const,
      sandboxScore: 2.0,
      aiScore: 0.0,
      finalScore: 2.0,
      jobStatus: 'FAILED' as const,
      errorStage: 'SANDBOX_EXECUTION' as const,
    },
    {
      assignment: createdAssignments[0],
      user: createdUsers['user@fpt.edu.vn'],
      paperCode: 'DE_01',
      status: 'GRADED' as const,
      sandboxScore: 5.5,
      aiScore: 1.5,
      finalScore: 7.0,
      jobStatus: 'COMPLETED' as const,
    },
  ];

  for (const s of sampleSubmissions) {
    if (!s.assignment || !s.user) continue;
    const existing = await prisma.submission.findFirst({
      where: { assignmentId: s.assignment.id, userId: s.user.id },
    });

    let subId = existing?.id;
    if (!existing) {
      const createdSub = await prisma.submission.create({
        data: {
          assignmentId: s.assignment.id,
          userId: s.user.id,
          paperCode: s.paperCode,
          status: s.status,
          sandboxScore: s.sandboxScore,
          aiScore: s.aiScore,
          finalScore: s.finalScore,
          submissionChannel: 'ZIP_UPLOAD',
          zipFilePath: `uploads/submissions/${s.assignment.id}/${s.user.id}/code.zip`,
          zipFileSize: BigInt(102400),
          submittedAt: new Date(Date.now() - Math.floor(Math.random() * 3600000)),
        },
      });
      subId = createdSub.id;
    }

    if (subId) {
      const existingJob = await prisma.gradingJob.findUnique({ where: { submissionId: subId } });
      if (!existingJob) {
        await prisma.gradingJob.create({
          data: {
            submissionId: subId,
            status: s.jobStatus,
            priority: 1,
            retryCount: s.jobStatus === 'FAILED' ? 1 : 0,
            errorStage: (s as any).errorStage || null,
            queuedAt: new Date(Date.now() - 1800000),
            sandboxStartedAt: s.jobStatus !== 'QUEUED' ? new Date(Date.now() - 1700000) : null,
            sandboxEndedAt: ['COMPLETED', 'FAILED', 'RUNNING_AI'].includes(s.jobStatus) ? new Date(Date.now() - 1600000) : null,
            aiStartedAt: ['COMPLETED', 'RUNNING_AI'].includes(s.jobStatus) ? new Date(Date.now() - 1500000) : null,
            aiEndedAt: s.jobStatus === 'COMPLETED' ? new Date(Date.now() - 1400000) : null,
          },
        });
      }
    }
  }
  console.log('✅ Đã tạo các bài nộp mẫu và hàng đợi Grading Jobs.');

  console.log('\n🎉 Hoàn thành xuất sắc toàn bộ quy trình Seed dữ liệu hệ thống!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
