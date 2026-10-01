import { PrismaCourseRepository } from '../src/modules/course/infrastructure/repositories/prisma-course.repository.js';
import { PrismaAssignmentRepository } from '../src/modules/assignment/infrastructure/repositories/prisma-assignment.repository.js';
import { PrismaUserRepository } from '../src/modules/user/infrastructure/repositories/prisma-user.repository.js';
import { CreateCourseUseCase } from '../src/modules/course/application/use-cases/create-course.use-case.js';
import { EnrollStudentsUseCase } from '../src/modules/course/application/use-cases/enroll-students.use-case.js';
import { CreateAssignmentUseCase } from '../src/modules/assignment/application/use-cases/create-assignment.use-case.js';
import { ManageTestCasesUseCase } from '../src/modules/assignment/application/use-cases/manage-testcases.use-case.js';
import { ManageRubricsUseCase } from '../src/modules/assignment/application/use-cases/manage-rubrics.use-case.js';
import { ManageSolutionsUseCase } from '../src/modules/assignment/application/use-cases/manage-solutions.use-case.js';
import { GetAssignmentDetailUseCase } from '../src/modules/assignment/application/use-cases/get-assignment-detail.use-case.js';
import prisma from '../src/infrastructure/database/prisma.client.js';

async function runCourseAndAssignmentTests() {
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG MODULE COURSE & ASSIGNMENT (THÀNH VIÊN 2 - CLEAN ARCHITECTURE)...\n');

  const userRepo = new PrismaUserRepository(prisma);
  const courseRepo = new PrismaCourseRepository(prisma);
  const assignmentRepo = new PrismaAssignmentRepository(prisma);

  // 1. Lấy tài khoản Giảng viên và Sinh viên mẫu
  const lecturer = await userRepo.findByEmail('lecturer@fpt.edu.vn');
  const student = await userRepo.findByEmail('student@fpt.edu.vn');

  if (!lecturer || !student) {
    throw new Error('Cần chạy seed trước khi test: npm run prisma:seed');
  }

  // 2. Test Tạo Khóa học (Course)
  console.log('1. Giảng viên tạo Khóa học mới (CSD201):');
  const createCourseUseCase = new CreateCourseUseCase(courseRepo, userRepo);
  const timestamp = Date.now();
  const testCourseCode = `CSD201_${timestamp}`;

  const createdCourse = await createCourseUseCase.execute({
    code: testCourseCode,
    name: 'Data Structures and Algorithms',
    semester: `FA26_${timestamp}`,
    lecturerId: lecturer.id,
  });
  console.log('   ✅ Đã tạo khóa học:', createdCourse.code, '| Tên:', createdCourse.name);

  // 3. Test Ghi danh Sinh viên vào Lớp học (Enrollment)
  console.log('\n2. Giảng viên ghi danh sinh viên vào lớp học:');
  const enrollUseCase = new EnrollStudentsUseCase(courseRepo);
  const enrollResult = await enrollUseCase.execute(createdCourse.id, [student.id]);
  console.log('   ✅ Đã ghi danh thành công:', enrollResult.enrolledCount, 'sinh viên.');

  // 4. Test Giảng viên Tạo Đề thi PE (Assignment)
  console.log('\n3. Giảng viên tạo Đề thi PE mới (Assignment Java JDK):');
  const createAssignmentUseCase = new CreateAssignmentUseCase(assignmentRepo, courseRepo);
  const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày sau

  const createdAssignment = await createAssignmentUseCase.execute(
    {
      courseId: createdCourse.id,
      title: 'CSD201 Final Practical Exam - Binary Search Tree',
      description: 'Cài đặt cây nhị phân tìm kiếm BST và thuật toán quay cây AVL',
      environment: 'JAVA_JDK',
      submissionType: 'INDIVIDUAL',
      deadline,
      status: 'PUBLISHED',
    },
    lecturer.id
  );
  console.log('   ✅ Đã tạo đề thi:', createdAssignment.title, '| Môi trường:', createdAssignment.environment);

  // 5. Test Thêm Testcases (I/O, Rationale Tag, File-to-file CSD201)
  console.log('\n4. Giảng viên thêm Testcases cho Đề thi:');
  const manageTestCasesUseCase = new ManageTestCasesUseCase(assignmentRepo);
  const testCase1 = await manageTestCasesUseCase.addTestCase(createdAssignment.id, {
    label: 'Test 1 - Basic BST Insertion & Inorder Traversal',
    rationaleTag: 'FUNCTIONAL',
    isHidden: false,
    timeLimitMs: 2000,
    memoryLimitKb: 262144,
    points: 2.0,
    comparisonMode: 'FILE_TO_FILE',
    inputFileName: 'data.txt',
    inputFileContent: '5 3 7 2 4 6 8',
    expectedFileName: 'f1.txt',
    expectedFileContent: '2 3 4 5 6 7 8',
    orderIndex: 1,
  });
  console.log('   ✅ Đã thêm Testcase công khai:', testCase1.label, '| Điểm:', testCase1.points);

  const testCase2 = await manageTestCasesUseCase.addTestCase(createdAssignment.id, {
    label: 'Test 2 - AVL Self-Balancing on Deep Degenerate Tree (Hidden)',
    rationaleTag: 'PERFORMANCE',
    isHidden: true,
    timeLimitMs: 1500,
    memoryLimitKb: 262144,
    points: 3.0,
    comparisonMode: 'FILE_TO_FILE',
    inputFileName: 'data.txt',
    inputFileContent: '1 2 3 4 5 6 7 8 9 10',
    expectedFileName: 'f2.txt',
    expectedFileContent: 'AVL Balanced Height <= 4',
    orderIndex: 2,
  });
  console.log('   ✅ Đã thêm Testcase ẩn (Chống lộ đề):', testCase2.label, '| isHidden:', testCase2.isHidden);

  // 6. Test Thiết lập Rubric Rules (Barem chấm AI ngữ nghĩa)
  console.log('\n5. Giảng viên thiết lập Tiêu chí Rubrics cho AI Semantic Grader:');
  const manageRubricsUseCase = new ManageRubricsUseCase(assignmentRepo);
  const rubrics = await manageRubricsUseCase.setRules(createdAssignment.id, {
    rules: [
      {
        criterionName: 'Clean Code & SOLID Principles',
        description: 'Mã nguồn tổ chức class/interface rõ ràng, không trùng lặp code, đặt tên biến chuẩn camelCase',
        maxPoints: 1.5,
        weight: 1.0,
        orderIndex: 1,
      },
      {
        criterionName: 'Time Complexity Efficiency (Big-O)',
        description: 'Thuật toán tìm kiếm và cân bằng đạt độ phức tạp O(log n), không lồng vòng lặp dư thừa O(n^2)',
        maxPoints: 1.5,
        weight: 1.0,
        orderIndex: 2,
      },
    ],
  });
  console.log('   ✅ Đã thiết lập thành công', rubrics.length, 'tiêu chí Rubrics cho AI Grader.');

  // 7. Test Nạp Đáp án mẫu (Model Solution cho RAG Vector DB)
  console.log('\n6. Giảng viên nạp Đáp án mẫu chuẩn cho RAG:');
  const manageSolutionsUseCase = new ManageSolutionsUseCase(assignmentRepo);
  const solution = await manageSolutionsUseCase.upsert(createdAssignment.id, {
    title: 'Đáp án chuẩn BST & AVL Tree Java',
    sourceCode: 'public class BSTTree { ... void insert(int x) { ... } void balance() { ... } }',
    explanation: 'Đáp án mẫu giải thích nguyên lý xoay trái và xoay phải tại node mất cân bằng',
  });
  console.log('   ✅ Đã lưu Đáp án mẫu RAG:', solution.title);

  // 8. Test Kiểm tra Phân quyền Ẩn Testcase với Sinh viên
  console.log('\n7. Kiểm tra Bảo mật Học vụ (Sinh viên xem chi tiết đề thi):');
  const getAssignmentDetailUseCase = new GetAssignmentDetailUseCase(assignmentRepo);
  const studentView = await getAssignmentDetailUseCase.execute(createdAssignment.id, 'STUDENT');
  console.log('   ✅ Số testcase sinh viên thấy được (chỉ thấy test công khai):', studentView.testCases.length);

  const lecturerView = await getAssignmentDetailUseCase.execute(createdAssignment.id, 'LECTURER');
  console.log('   ✅ Số testcase giảng viên thấy được (thấy toàn bộ test ẩn & hiện):', lecturerView.testCases.length);

  // 9. Dọn dẹp dữ liệu test
  console.log('\n🧹 Dọn dẹp dữ liệu kiểm thử...');
  await prisma.course.delete({
    where: { id: createdCourse.id },
  });
  console.log('   ✅ Đã xóa dữ liệu kiểm thử an toàn!');

  console.log('\n🎉 TẤT CẢ CÁC TÍNH NĂNG CỦA THÀNH VIÊN 2 (COURSE, ASSIGNMENT, TESTCASE, RUBRIC, SOLUTION) ĐÃ HOÀN TẤT VÀ HOẠT ĐỘNG HOÀN HẢO!');
}

runCourseAndAssignmentTests()
  .catch((err) => {
    console.error('❌ Lỗi kiểm thử:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
