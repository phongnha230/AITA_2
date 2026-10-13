import dotenv from 'dotenv';
import path from 'path';

// Load biến môi trường từ Code/backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import prisma from '../src/infrastructure/database/prisma.client';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

async function testTiDBConnection() {
  console.log(`\n${colors.bright}${colors.cyan}==============================================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}         [AITA] KIỂM TRA KẾT NỐI TIDB CLOUD SERVERLESS DATABASE             ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}==============================================================================${colors.reset}\n`);

  const rawDbUrl = process.env.DATABASE_URL || '';
  if (!rawDbUrl) {
    console.error(`   ${colors.red}❌ LỖI: Chưa cấu hình DATABASE_URL trong file .env!${colors.reset}`);
    process.exit(1);
  }

  const maskedUrl = rawDbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log(`   ${colors.dim}Target URL:${colors.reset} ${maskedUrl}`);

  const startTime = Date.now();
  try {
    // 1. Kiểm tra truy vấn Ping
    console.log(`\n   ${colors.yellow}Đang gửi truy vấn ping tới TiDB Cloud...${colors.reset}`);
    await prisma.$queryRaw<Array<{ result: number }>>`SELECT 1 + 1 AS result`;
    const latency = Date.now() - startTime;

    // 2. Lấy thông tin phiên bản TiDB và tên database
    const versionResult = await prisma.$queryRaw<Array<{ version: string }>>`SELECT VERSION() AS version`;
    const dbNameResult = await prisma.$queryRaw<Array<{ db_name: string }>>`SELECT DATABASE() AS db_name`;

    const version = versionResult[0]?.version || 'Unknown';
    const dbName = dbNameResult[0]?.db_name || 'Unknown';

    // 3. Đếm số lượng bảng
    const tablesResult = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      ORDER BY table_name ASC
    `;

    console.log(`\n   ${colors.green}✔ KẾT NỐI THÀNH CÔNG TỚI TIDB CLOUD!${colors.reset}`);
    console.log(`   ------------------------------------------------------------`);
    console.log(`   ${colors.dim}Độ trễ phản hồi (Latency):${colors.reset} ${latency} ms`);
    console.log(`   ${colors.dim}Phiên bản TiDB:${colors.reset}             ${version}`);
    console.log(`   ${colors.dim}Database hiện tại:${colors.reset}         ${dbName}`);
    console.log(`   ${colors.dim}Tổng số bảng schema:${colors.reset}       ${tablesResult.length} bảng`);

    if (tablesResult.length > 0) {
      console.log(`   ${colors.dim}Danh sách các bảng:${colors.reset}        ${tablesResult.map(t => t.table_name).join(', ')}`);
      
      // Đếm dữ liệu tổng quan
      const userCount = await prisma.user.count();
      const assignmentCount = await prisma.assignment.count();
      console.log(`   ${colors.dim}Dữ liệu thực tế:${colors.reset}            ${userCount} Users | ${assignmentCount} Đề thi (Assignments)`);
    } else {
      console.log(`   ${colors.yellow}⚠️ Cảnh báo: Database chưa có bảng nào. Hãy chạy 'npx prisma db push' để đồng bộ schema!${colors.reset}`);
    }

    console.log(`\n${colors.bright}${colors.green}🎉 Hệ thống AITA sẵn sàng làm việc với TiDB Cloud!${colors.reset}\n`);
  } catch (error: any) {
    console.error(`\n   ${colors.red}❌ KẾT NỐI THẤT BẠI!${colors.reset}`);
    console.error(`   ${colors.red}Chi tiết lỗi:${colors.reset}`, error.message || error);
    console.log(`\n   ${colors.yellow}💡 Gợi ý khắc phục:${colors.reset}`);
    console.log(`   1. Đảm bảo chuỗi DATABASE_URL có tham số '?sslaccept=strict'`);
    console.log(`   2. Kiểm tra tài khoản và mật khẩu TiDB Cloud có đúng không`);
    console.log(`   3. Đảm bảo mạng của bạn cho phép kết nối tới cổng 4000 ra Internet`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testTiDBConnection();
