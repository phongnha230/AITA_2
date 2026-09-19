import dotenv from 'dotenv';
import path from 'path';

// Load .env từ thư mục backend
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/infrastructure/database/prisma.client';
import { redisConnection } from '../src/infrastructure/queue/redis.client';

// Màu sắc console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

async function testDatabaseConnection() {
  console.log(`\n${colors.bright}${colors.cyan}==============================================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}      [AITA] KIỂM TRA KẾT NỐI CƠ SỞ DỮ LIỆU & HẠ TẦNG (SYSTEM HEALTH)       ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}==============================================================================${colors.reset}\n`);

  let mysqlSuccess = false;
  let redisSuccess = false;

  // ---------------------------------------------------------------------------
  // 1. KIỂM TRA MYSQL (PRISMA ORM)
  // ---------------------------------------------------------------------------
  console.log(`${colors.bright}1. KIỂM TRA CSDL MYSQL (PRISMA):${colors.reset}`);
  const rawDbUrl = process.env.DATABASE_URL || '';
  const maskedUrl = rawDbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log(`   ${colors.dim}Target URL:${colors.reset} ${maskedUrl}`);

  const startDb = Date.now();
  try {
    // Ping truy vấn cơ bản
    const pingResult = await prisma.$queryRaw<Array<{ result: number }>>`SELECT 1 + 1 AS result`;
    const latencyDb = Date.now() - startDb;

    // Lấy thông tin phiên bản MySQL và tên database
    const versionResult = await prisma.$queryRaw<Array<{ version: string }>>`SELECT VERSION() AS version`;
    const dbNameResult = await prisma.$queryRaw<Array<{ db_name: string }>>`SELECT DATABASE() AS db_name`;

    const version = versionResult[0]?.version || 'Unknown';
    const dbName = dbNameResult[0]?.db_name || 'Unknown';

    // Đếm số lượng bảng đang có trong database
    const tablesResult = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      ORDER BY table_name ASC
    `;

    console.log(`   ${colors.green}✔ Trạng thái: KẾT NỐI THÀNH CÔNG!${colors.reset}`);
    console.log(`   ${colors.dim}Độ trễ (Latency):${colors.reset} ${latencyDb} ms`);
    console.log(`   ${colors.dim}Phiên bản MySQL:${colors.reset} ${version}`);
    console.log(`   ${colors.dim}Database hiện tại:${colors.reset} ${dbName}`);
    console.log(`   ${colors.dim}Tổng số bảng tìm thấy:${colors.reset} ${tablesResult.length} bảng`);

    if (tablesResult.length > 0) {
      const tableNames = tablesResult
        .map((t: any) => t.table_name || t.TABLE_NAME || Object.values(t)[0])
        .join(', ');
      console.log(`   ${colors.dim}Danh sách bảng:${colors.reset} [ ${colors.cyan}${tableNames}${colors.reset} ]`);

      // Kiểm tra nhanh bảng users và assignments nếu đã tồn tại
      try {
        const userCount = await prisma.user.count();
        const assignmentCount = await prisma.assignment.count();
        console.log(`   ${colors.dim}Dữ liệu hiện có:${colors.reset} ${userCount} Users | ${assignmentCount} Assignments`);
      } catch {
        // Bỏ qua nếu bảng chưa được migrate
      }
    } else {
      console.log(`   ${colors.yellow}⚠ Cảnh báo: Database đang trống (chưa có bảng nào).${colors.reset}`);
      console.log(`   ${colors.yellow}👉 Hãy chạy: npx prisma db push để tạo toàn bộ bảng CSDL!${colors.reset}`);
    }

    mysqlSuccess = true;
  } catch (error: any) {
    const latencyDb = Date.now() - startDb;
    console.log(`   ${colors.red}✖ Trạng thái: KẾT NỐI THẤT BẠI! (${latencyDb} ms)${colors.reset}`);
    console.log(`   ${colors.red}Chi tiết lỗi: ${error.message}${colors.reset}`);
    console.log(`   ${colors.yellow}💡 Hướng xử lý:${colors.reset}`);
    console.log(`      1. Đảm bảo MySQL đã được bật (chạy 'docker compose up -d' hoặc bật XAMPP / MySQL Service).`);
    console.log(`      2. Kiểm tra chuỗi DATABASE_URL trong file Code/backend/.env.`);
    console.log(`      3. Nếu mật khẩu có ký tự đặc biệt (như @, #), hãy mã hóa URL (ví dụ: @ thành %40).`);
  }

  console.log('\n------------------------------------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // 2. KIỂM TRA REDIS (IOREDIS)
  // ---------------------------------------------------------------------------
  console.log(`${colors.bright}2. KIỂM TRA HÀNG ĐỢI REDIS (BULLMQ):${colors.reset}`);
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = process.env.REDIS_PORT || 6379;
  console.log(`   ${colors.dim}Target Server:${colors.reset} ${redisHost}:${redisPort}`);

  const startRedis = Date.now();
  try {
    // Kết nối Redis
    await redisConnection.connect().catch(() => {});
    const pong = await redisConnection.ping();
    const latencyRedis = Date.now() - startRedis;

    if (pong === 'PONG') {
      // Thử ghi và xóa 1 key test
      const testKey = 'aita_test_health_check';
      await redisConnection.set(testKey, 'OK', 'EX', 10);
      const readVal = await redisConnection.get(testKey);
      await redisConnection.del(testKey);

      console.log(`   ${colors.green}✔ Trạng thái: KẾT NỐI THÀNH CÔNG!${colors.reset}`);
      console.log(`   ${colors.dim}Độ trễ (Latency):${colors.reset} ${latencyRedis} ms`);
      console.log(`   ${colors.dim}Phản hồi PING:${colors.reset} ${pong}`);
      console.log(`   ${colors.dim}Kiểm tra Ghi/Đọc (I/O Read-Write):${colors.reset} ${readVal === 'OK' ? 'HOÀN HẢO' : 'LỖI'}`);
      redisSuccess = true;
    } else {
      console.log(`   ${colors.yellow}⚠ Phản hồi không xác định: ${pong}${colors.reset}`);
    }
  } catch (error: any) {
    const latencyRedis = Date.now() - startRedis;
    console.log(`   ${colors.red}✖ Trạng thái: KẾT NỐI THẤT BẠI! (${latencyRedis} ms)${colors.reset}`);
    console.log(`   ${colors.red}Chi tiết lỗi: ${error.message}${colors.reset}`);
    console.log(`   ${colors.yellow}💡 Hướng xử lý:${colors.reset}`);
    console.log(`      1. Đảm bảo Redis đã được bật (chạy 'docker compose up -d' hoặc bật Memurai/Redis Service).`);
    console.log(`      2. Kiểm tra cổng REDIS_PORT=6379 trong file Code/backend/.env.`);
  }

  console.log(`\n${colors.bright}${colors.cyan}==============================================================================${colors.reset}`);
  console.log(`${colors.bright}TỔNG KẾT HẠ TẦNG:${colors.reset}`);
  console.log(`  - MySQL Database: ${mysqlSuccess ? `${colors.green}🟢 HOẠT ĐỘNG TỐT${colors.reset}` : `${colors.red}🔴 CHƯA KẾT NỐI ĐƯỢC${colors.reset}`}`);
  console.log(`  - Redis Queue:    ${redisSuccess ? `${colors.green}🟢 HOẠT ĐỘNG TỐT${colors.reset}` : `${colors.red}🔴 CHƯA KẾT NỐI ĐƯỢC${colors.reset}`}`);

  if (mysqlSuccess && redisSuccess) {
    console.log(`\n${colors.bright}${colors.green}🎉 XUẤT SẮC! Hạ tầng CSDL và Hàng đợi đã sẵn sàng 100% để chạy hệ thống!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}⚠ Hãy sửa các lỗi kết nối ở trên trước khi bắt đầu code hoặc chạy server!${colors.reset}`);
  }
  console.log(`${colors.bright}${colors.cyan}==============================================================================${colors.reset}\n`);

  // Đóng kết nối an toàn
  await prisma.$disconnect();
  redisConnection.disconnect();
  process.exit(mysqlSuccess ? 0 : 1);
}

testDatabaseConnection().catch((err) => {
  console.error('Lỗi không mong muốn trong script kiểm tra:', err);
  process.exit(1);
});
