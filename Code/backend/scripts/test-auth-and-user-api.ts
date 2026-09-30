import { PrismaUserRepository } from '../src/modules/user/infrastructure/repositories/prisma-user.repository.js';
import { BcryptHasherService } from '../src/modules/auth/infrastructure/services/bcrypt-hasher.service.js';
import { JwtTokenService } from '../src/modules/auth/infrastructure/services/jwt-token.service.js';
import { AdminCreateUserUseCase } from '../src/modules/user/application/use-cases/admin-create-user.use-case.js';
import { AdminCreateBatchUsersUseCase } from '../src/modules/user/application/use-cases/admin-create-batch-users.use-case.js';
import { LoginUseCase } from '../src/modules/auth/application/use-cases/login.use-case.js';
import { ChangePasswordUseCase } from '../src/modules/auth/application/use-cases/change-password.use-case.js';
import { GetUsersUseCase } from '../src/modules/user/application/use-cases/get-users.use-case.js';
import prisma from '../src/infrastructure/database/prisma.client.js';

async function runTests() {
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG CÁC USE CASE AUTH & USER (CLEAN ARCHITECTURE)...\n');

  const userRepo = new PrismaUserRepository(prisma);
  const hasher = new BcryptHasherService();
  const tokenService = new JwtTokenService();

  // 1. Test Admin Create Lecturer
  console.log('1. Admin tạo tài khoản Giảng viên mới:');
  const adminCreateUserUseCase = new AdminCreateUserUseCase(userRepo, hasher);
  const testLecturerEmail = `test.lecturer.${Date.now()}@fpt.edu.vn`;

  const createdLecturer = await adminCreateUserUseCase.execute({
    email: testLecturerEmail,
    fullName: 'Thầy Nguyễn Văn Giảng Viên Test',
    password: 'LecturerPass@123',
    role: 'LECTURER',
    status: 'ACTIVE',
  });
  console.log('   ✅ Đã tạo thành công Giảng viên:', createdLecturer.email, '| Role:', createdLecturer.role);

  // 2. Test Login with newly created Lecturer
  console.log('\n2. Giảng viên vừa tạo tiến hành Đăng nhập:');
  const loginUseCase = new LoginUseCase(userRepo, hasher, tokenService);
  const loginResult = await loginUseCase.execute({
    username: testLecturerEmail,
    password: 'LecturerPass@123',
  });
  console.log('   ✅ Đăng nhập thành công! Token sinh ra:', loginResult.token.substring(0, 30) + '...');
  console.log('   ✅ Redirect to:', loginResult.redirectTo);

  // 3. Test Change Password
  console.log('\n3. Giảng viên đổi mật khẩu cá nhân:');
  const changePasswordUseCase = new ChangePasswordUseCase(userRepo, hasher);
  await changePasswordUseCase.execute(createdLecturer.id, {
    currentPassword: 'LecturerPass@123',
    newPassword: 'NewLecturerPass@456',
    confirmPassword: 'NewLecturerPass@456',
  });
  console.log('   ✅ Đổi mật khẩu thành công!');

  // 4. Test Login with new password
  console.log('\n4. Đăng nhập lại với mật khẩu mới:');
  const newLoginResult = await loginUseCase.execute({
    username: testLecturerEmail,
    password: 'NewLecturerPass@456',
  });
  console.log('   ✅ Đăng nhập thành công với mật khẩu mới!');

  // 5. Test Admin Batch Create Users (Import)
  console.log('\n5. Admin tạo hàng loạt (Batch Create/Import) Sinh viên:');
  const batchCreateUseCase = new AdminCreateBatchUsersUseCase(userRepo, hasher);
  const timestamp = Date.now();
  const batchResult = await batchCreateUseCase.execute([
    {
      email: `student1.${timestamp}@fpt.edu.vn`,
      fullName: 'Sinh Viên 1',
      role: 'STUDENT',
      password: 'password123',
    },
    {
      email: `student2.${timestamp}@fpt.edu.vn`,
      fullName: 'Sinh Viên 2',
      role: 'STUDENT',
      password: 'password123',
    },
  ]);
  console.log('   ✅ Xử lý batch thành công:', batchResult.succeeded.length, 'tài khoản tạo mới,', batchResult.failed.length, 'lỗi.');

  // 6. Test Admin Get Users List with Pagination
  console.log('\n6. Admin lấy danh sách Users:');
  const getUsersUseCase = new GetUsersUseCase(userRepo);
  const usersList = await getUsersUseCase.execute({ page: 1, limit: 5 });
  console.log('   ✅ Tổng số tài khoản trong hệ thống:', usersList.total, '| Lấy được:', usersList.users.length, 'tài khoản trên trang 1.');

  // Dọn dẹp test data
  console.log('\n🧹 Dọn dẹp dữ liệu test...');
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          testLecturerEmail,
          `student1.${timestamp}@fpt.edu.vn`,
          `student2.${timestamp}@fpt.edu.vn`,
        ],
      },
    },
  });
  console.log('   ✅ Đã xóa dữ liệu kiểm thử an toàn!');

  console.log('\n🎉 TẤT CẢ CÁC TÍNH NĂNG AUTH & QUẢN TRỊ USER ĐÃ HOẠT ĐỘNG HOÀN HẢO!');
}

runTests()
  .catch((err) => {
    console.error('❌ Lỗi kiểm thử:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
