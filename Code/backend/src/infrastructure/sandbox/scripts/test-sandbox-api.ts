import app from '../../../app.js';
import { Server } from 'http';

async function testSandboxApi() {
  console.log('================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG CÁC API CỦA MODULE SANDBOX (TV4)...');
  console.log('================================================================\n');

  const TEST_PORT = 5055;
  let server: Server;

  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`📡 [Mock Server] Đã khởi chạy server test tại: http://localhost:${TEST_PORT}`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: GET /api/v1/sandbox/status
    // -------------------------------------------------------------
    console.log('\n--------------------------------------------------------------');
    console.log('TEST 1: Gọi GET /api/v1/sandbox/status (Kiểm tra trạng thái Sandbox)');
    console.log('--------------------------------------------------------------');
    const statusRes = await fetch(`http://localhost:${TEST_PORT}/api/v1/sandbox/status`);
    const statusData: any = await statusRes.json();

    console.log(`👉 HTTP Status Code: ${statusRes.status} (Kỳ vọng: 200)`);
    console.log('👉 Response Data:', JSON.stringify(statusData, null, 2));

    if (statusRes.status !== 200 || !statusData.success) {
      throw new Error('TEST 1 THẤT BẠI: API status không trả về 200 OK');
    }
    console.log('✅ TEST 1 THÀNH CÔNG: API status hoạt động tốt!');

    // -------------------------------------------------------------
    // TEST 2: POST /api/v1/sandbox/execute (Chấm bài Java PRO192)
    // -------------------------------------------------------------
    console.log('\n--------------------------------------------------------------');
    console.log('TEST 2: Gọi POST /api/v1/sandbox/execute (Biên dịch và chấm điểm Java)');
    console.log('--------------------------------------------------------------');

    const javaCode = `
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int a = sc.nextInt();
            int b = sc.nextInt();
            System.out.println(a + b);
        }
    }
}
    `;

    const requestPayload = {
      language: 'JAVA',
      sourceCode: javaCode.trim(),
      testCases: [
        {
          id: 'tc-01',
          questionNo: 'Q1',
          inputData: '10 25',
          expectedOutput: '35',
          timeLimitMs: 2000,
          memoryLimitMb: 256,
          score: 5.0,
        },
        {
          id: 'tc-02',
          questionNo: 'Q1',
          inputData: '100 250',
          expectedOutput: '350',
          timeLimitMs: 2000,
          memoryLimitMb: 256,
          score: 5.0,
        },
      ],
    };

    const execRes = await fetch(`http://localhost:${TEST_PORT}/api/v1/sandbox/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });

    const execData: any = await execRes.json();
    console.log(`👉 HTTP Status Code: ${execRes.status} (Kỳ vọng: 200)`);
    console.log('👉 Response Data:', JSON.stringify(execData, null, 2));

    if (execRes.status !== 200 || !execData.success) {
      throw new Error('TEST 2 THẤT BẠI: API execute không trả về 200 OK');
    }

    const summary = execData.data;
    if (summary.passedTests !== 2 || summary.totalScore !== 10) {
      throw new Error(`TEST 2 THẤT BẠI: Điểm không đúng kỳ vọng (${summary.totalScore}/10)`);
    }

    console.log('✅ TEST 2 THÀNH CÔNG: Chấm 2/2 testcase Java đạt điểm tối đa (10/10)!');

    // -------------------------------------------------------------
    // KẾT LUẬN
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log('🎉 TẤT CẢ CÁC API CỦA MODULE DOCKER SANDBOX (TV4) ĐỀU HOẠT ĐỘNG HOÀN HẢO!');
    console.log('================================================================\n');

  } catch (error: any) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH TEST:', error.message);
  } finally {
    server!.close(() => {
      console.log('🛑 [Mock Server] Đã đóng kết nối test server an toàn.');
    });
  }
}

testSandboxApi();
