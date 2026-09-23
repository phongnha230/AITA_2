# 5. Các Mẫu Thiết Kế (Design Patterns) Trong Hệ Thống AITA

Tài liệu này hệ thống hóa toàn bộ các **Design Patterns (Mẫu Thiết Kế Phần Mềm)** được áp dụng trong dự án AITA (AI-powered Teaching Assistant System). Tài liệu được cấu trúc chặt chẽ từ **định nghĩa lý thuyết chuẩn mực** đến **ứng dụng thực tế trong mã nguồn**, phục vụ trực tiếp cho việc học tập, giải trình mã nguồn và bảo vệ đồ án **SWD392** tại Đại học FPT.

---

## 0. KHÁI NIỆM NỀN TẢNG: DESIGN PATTERN LÀ GÌ?

### 0.1. Định nghĩa chuẩn (Definition)
> **Design Pattern (Mẫu thiết kế phần mềm)** là các giải pháp tổng quát, tối ưu và đã được kiểm chứng qua thời gian để giải quyết những vấn đề phổ biến, lặp đi lặp lại trong quá trình phân tích, thiết kế và lập trình hướng đối tượng (OOP).

* **Nguồn gốc lịch sử:** Khái niệm này được phổ biến rộng rãi bởi nhóm tác giả **Gang of Four (GoF)** gồm *Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides* trong cuốn sách kinh điển xuất bản năm 1994: *"Design Patterns: Elements of Reusable Object-Oriented Software"*.
* **Bản chất kỹ thuật:** 
  - Design Pattern **KHÔNG PHẢI** là một đoạn code cụ thể, một hàm (function) hay một thư viện (library/framework) có thể tải về bằng lệnh `npm install`.
  - Design Pattern là một **bản vẽ kiến trúc tư duy (architectural blueprint/template)** mô tả mối quan hệ giữa các Lớp (Classes), Đối tượng (Objects) và cách chúng tương tác với nhau để giải quyết một bài toán thiết kế cụ thể.

### 0.2. Phân loại 3 nhóm Design Patterns kinh điển (GoF Classification)
1. **Creational Patterns (Nhóm Mẫu Khởi Tạo):** Tập trung vào cơ chế khởi tạo đối tượng (Object Creation Mechanisms), giúp tăng tính linh hoạt và khả năng tái sử dụng code bằng cách kiểm soát quá trình tạo ra đối tượng thay vì khởi tạo trực tiếp bằng từ khóa `new`.
2. **Structural Patterns (Nhóm Mẫu Cấu Trúc):** Tập trung vào cách lắp ghép, liên kết các lớp và đối tượng lại với nhau để tạo thành các cấu trúc lớn hơn, linh hoạt hơn nhưng vẫn đảm bảo tính độc lập giữa các thành phần.
3. **Behavioral Patterns (Nhóm Mẫu Hành Vi):** Tập trung vào việc phân chia trách nhiệm, giao tiếp và quản lý luồng thực thi thuật toán giữa các đối tượng trong hệ thống.

Ngoài ra, trong các ứng dụng hiện đại còn có nhóm **Enterprise & Architectural Patterns** (như *Repository Pattern, Dependency Injection*) giúp phân tách các tầng kiến trúc (Clean Architecture/Layered Architecture).

### 0.3. Vì sao đồ án SWD392 của nhóm AITA bắt buộc áp dụng Design Patterns?
1. **Tuân thủ chuẩn các nguyên lý SOLID:** Đặc biệt là **Single Responsibility Principle (SRP)**, **Open/Closed Principle (OCP)** và **Dependency Inversion Principle (DIP)**.
2. **Ngôn ngữ giao tiếp chung (Ubiquitous Vocabulary):** Khi các thành viên trong nhóm 6 người hoặc giảng viên phản biện nhắc đến *"Dùng Strategy cho bộ chấm"* hay *"Dùng Factory cho Sandbox"*, mọi người đều hiểu ngay cấu trúc mã nguồn mà không cần giải thích dài dòng.
3. **Dễ mở rộng không giới hạn (Extensibility):** Khi cần thêm ngôn ngữ lập trình mới (như C#, Python), thêm nhà cung cấp AI mới (Gemini, Claude, DeepSeek) hay thêm loại bài tập mới (Trắc nghiệm, Tự luận, Code PE), hệ thống chỉ cần "cắm thêm" module mới mà không sửa code cũ.
4. **Hỗ trợ kiểm thử tự động (Testability & Mocking):** Nhờ việc tách rời các thành phần lỏng lẻo (loose coupling), các kỹ sư có thể dễ dàng viết Unit Test và Mocking dữ liệu mà không cần phụ thuộc vào Database thật hay Docker daemon.

---

## 📌 TỔNG QUAN CÁC DESIGN PATTERNS ÁP DỤNG TRONG AITA

| Nhóm Pattern | Tên Pattern | Vị trí áp dụng trong Source Code | Mục đích giải quyết vấn đề trong AITA |
| :--- | :--- | :--- | :--- |
| **Creational** | **Factory Method** | `src/core/services/sandbox/SandboxRunnerFactory.ts` | Khởi tạo môi trường Docker Sandbox tương ứng với từng ngôn ngữ lập trình (C, Java, Python). |
| **Creational** | **Singleton** | `src/infrastructure/database/prisma.ts`, `redis.ts` | Đảm bảo duy nhất 1 connection pool tới Database và Redis, tránh leak resource và sập kết nối. |
| **Structural** | **Adapter** | `src/infrastructure/adapters/llm/LlmProviderAdapter.ts` | Chuẩn hóa interface giao tiếp với các nhà cung cấp AI khác nhau (Gemini, OpenAI, Claude). |
| **Structural** | **Facade** | `src/core/services/rag/RagKnowledgeFacade.ts` | Gom các luồng xử lý phức tạp của RAG (chunking, embedding, vector search, LLM context) vào 1 hàm duy nhất. |
| **Structural** | **Proxy / Cache-Aside** | `src/infrastructure/cache/RedisCacheProxy.ts` | Bọc tầng truy vấn AI / Database để cache kết quả phổ biến, tiết kiệm quota API token. |
| **Behavioral** | **Strategy** | `src/core/services/grading/strategies/` | Tách biệt các giải thuật chấm điểm khác nhau: Trắc nghiệm, Tự luận AI, Thực hành Code. |
| **Behavioral** | **Observer (Pub/Sub)** | `src/infrastructure/queue/JobStatusObserver.ts` | Theo dõi tiến độ chấm bài bất đồng bộ qua Redis và push thông báo thời gian thực về Frontend qua WebSocket/SSE. |
| **Behavioral** | **Template Method** | `src/core/services/sandbox/BaseSandboxRunner.ts` | Định nghĩa khung xương (skeleton) các bước chạy bài thi: Setup -> Compile -> Run with Timeout -> Teardown. |
| **Enterprise** | **Repository Pattern** | `src/infrastructure/repositories/` | Trừu tượng hóa truy vấn Prisma, tách biệt Business Logic khỏi Database Engine. |
| **Enterprise** | **Dependency Injection** | Toàn bộ tầng Controller -> Service -> Repository | Áp dụng IoC (Inversion of Control), dễ dàng mock data khi viết Unit Test. |

---

## 1. CREATIONAL PATTERNS (NHÓM MẪU KHỞI TẠO)

### 1.1. Factory Method Pattern
#### A. Định nghĩa chuẩn (Definition)
> **Factory Method** là mẫu thiết kế thuộc nhóm Khởi tạo (Creational), định nghĩa một interface hoặc abstract method để tạo đối tượng, nhưng để cho các lớp con hoặc factory class quyết định lớp cụ thể nào sẽ được khởi tạo. Factory Method cho phép một lớp trì hoãn việc khởi tạo đối tượng cụ thể (instantiation) cho tới khi runtime.

#### B. Vấn đề thực tế trong AITA
Sinh viên nộp bài thi thực hành (PE) với nhiều ngôn ngữ khác nhau: C (PRF192), Java (PRO192, CSD201), Python. Mỗi ngôn ngữ yêu cầu trình biên dịch (compiler), memory limit, cgroups options và Docker container base image hoàn toàn khác nhau. Nếu dùng một chuỗi `switch-case` hoặc `if-else` khổng lồ rải rác khắp Controller hay Service thì mỗi khi trường mở thêm môn C# hay Go, ta buộc phải sửa code cũ, vi phạm trực tiếp nguyên lý **Open/Closed Principle (OCP)**.

#### C. Giải pháp kiến trúc
Xây dựng interface chung `ISandboxRunner`, các runner cụ thể kế thừa interface này (`CppSandboxRunner`, `JavaSandboxRunner`, `PythonSandboxRunner`), và tạo `SandboxRunnerFactory` đóng vai trò điểm sản xuất runner duy nhất.

#### D. Minh họa mã nguồn (TypeScript)
```typescript
// 1. Interface chuẩn hóa cho tất cả các Runner
export interface ISandboxRunner {
  run(submissionPath: string, testcases: TestCase[]): Promise<TestRunResult>;
}

// 2. Các Concrete Runners cụ thể cho từng ngôn ngữ
export class CppSandboxRunner implements ISandboxRunner {
  async run(path: string, testcases: TestCase[]): Promise<TestRunResult> {
    // Biên dịch gcc/g++, chạy binary trong container Linux c-sandbox:latest
    return { passed: true, score: 10, details: [] };
  }
}

export class JavaSandboxRunner implements ISandboxRunner {
  async run(path: string, testcases: TestCase[]): Promise<TestRunResult> {
    // Biên dịch javac, chạy JVM với cờ -Xmx256m trong openjdk:17-alpine
    return { passed: true, score: 10, details: [] };
  }
}

export class PythonSandboxRunner implements ISandboxRunner {
  async run(path: string, testcases: TestCase[]): Promise<TestRunResult> {
    // Chạy python3 thông dịch với time-limit 2.0s
    return { passed: true, score: 10, details: [] };
  }
}

// 3. Factory Method: Khởi tạo Runner dựa vào tham số đầu vào
export class SandboxRunnerFactory {
  public static createRunner(language: string): ISandboxRunner {
    switch (language.toLowerCase()) {
      case 'c':
      case 'cpp':
        return new CppSandboxRunner();
      case 'java':
        return new JavaSandboxRunner();
      case 'python':
        return new PythonSandboxRunner();
      default:
        throw new Error(`Unsupported programming language for sandbox: ${language}`);
    }
  }
}
```

---

### 1.2. Singleton Pattern
#### A. Định nghĩa chuẩn (Definition)
> **Singleton** là mẫu thiết kế thuộc nhóm Khởi tạo (Creational), đảm bảo rằng một lớp **chỉ có duy nhất một thể hiện (single instance)** tồn tại trong suốt vòng đời của ứng dụng, đồng thời cung cấp một điểm truy cập toàn cục (global access point) đến thể hiện đó.

#### B. Vấn đề thực tế trong AITA
Trong môi trường Node.js / Express backend, nếu mỗi Service hoặc Repository khi cần truy vấn Database lại gọi `new PrismaClient()` hoặc `new Redis()`, hàng trăm request nộp bài cùng lúc sẽ khởi tạo hàng trăm pool kết nối riêng biệt. Hậu quả là làm MySQL bị cạn kiệt connection (`Error: Too many connections`), gây sập toàn bộ hệ thống.

#### C. Giải pháp kiến trúc
Khóa constructor của class kết nối bằng từ khóa `private` và cung cấp một static method `getInstance()` để cấp phát và tái sử dụng đúng 1 instance duy nhất.

#### D. Minh họa mã nguồn (TypeScript)
```typescript
import { PrismaClient } from '@prisma/client';

class DatabaseConnection {
  private static instance: PrismaClient | null = null;

  // Constructor private ngăn không cho phép 'new DatabaseConnection()' từ bên ngoài
  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
      });
      console.log('✅ [DatabaseConnection] Khởi tạo thành công kết nối Prisma duy nhất (Singleton).');
    }
    return DatabaseConnection.instance;
  }
}

// Export duy nhất một instance dùng chung cho toàn bộ Backend
export const prisma = DatabaseConnection.getInstance();
```

---

## 2. STRUCTURAL PATTERNS (NHÓM MẪU CẤU TRÚC)

### 2.1. Adapter Pattern
#### A. Định nghĩa chuẩn (Definition)
> **Adapter** (hay còn gọi là **Wrapper**) là mẫu thiết kế thuộc nhóm Cấu trúc (Structural), cho phép các đối tượng có giao diện (interfaces) không tương thích có thể làm việc được với nhau. Adapter đóng vai trò như một "bộ chuyển đổi phích cắm", bọc lấy một lớp có sẵn và biến đổi giao diện của nó thành dạng giao diện mà client mong đợi.

#### B. Vấn đề thực tế trong AITA
Hệ thống AI của AITA sử dụng nhiều nhà cung cấp LLM khác nhau:
- Google Gemini SDK: dùng cú pháp `new GoogleGenAI() -> model.generateContent(prompt)`
- OpenAI SDK: dùng cú pháp `new OpenAI() -> openai.chat.completions.create({ messages: [...] })`
- Anthropic Claude SDK: dùng cú pháp `anthropic.messages.create(...)`

Nếu mã nguồn Service trực tiếp import và gọi các hàm này thì khi đổi model hoặc khi Google Gemini bảo trì, ta phải đi sửa lại từng file Service.

#### C. Giải pháp kiến trúc
Xây dựng interface chuẩn `ILlmProvider` với phương thức chung `chat(prompt)`. Các Adapter (`GeminiAdapter`, `OpenAIAdapter`) sẽ bọc lấy SDK tương ứng và chuyển đổi dữ liệu đầu ra về kiểu chuẩn `LlmResponse`.

#### D. Minh họa mã nguồn (TypeScript)
```typescript
// 1. Interface chuẩn hóa mục tiêu mà hệ thống cần
export interface LlmResponse {
  content: string;
  tokensUsed: number;
}

export interface ILlmProvider {
  chat(systemPrompt: string, userMessage: string): Promise<LlmResponse>;
}

// 2. Adapter cho Google Gemini
import { GoogleGenAI } from '@google/genai';

export class GeminiAdapter implements ILlmProvider {
  constructor(private client: GoogleGenAI, private modelName: string) {}

  async chat(systemPrompt: string, userMessage: string): Promise<LlmResponse> {
    const model = this.client.getGenerativeModel({ 
      model: this.modelName, 
      systemInstruction: systemPrompt 
    });
    const result = await model.generateContent(userMessage);
    return {
      content: result.response.text(),
      tokensUsed: result.response.usageMetadata?.totalTokenCount || 0,
    };
  }
}

// 3. Adapter cho OpenAI
import OpenAI from 'openai';

export class OpenAIAdapter implements ILlmProvider {
  constructor(private openai: OpenAI, private modelName: string) {}

  async chat(systemPrompt: string, userMessage: string): Promise<LlmResponse> {
    const res = await this.openai.chat.completions.create({
      model: this.modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });
    return {
      content: res.choices[0].message.content || '',
      tokensUsed: res.usage?.total_tokens || 0,
    };
  }
}
```

---

### 2.2. Facade Pattern
#### A. Định nghĩa chuẩn (Definition)
> **Facade** là mẫu thiết kế thuộc nhóm Cấu trúc (Structural), cung cấp một giao diện đơn giản hóa (simplified interface) cho một hệ thống con (subsystem) phức tạp chứa nhiều class, thư viện hoặc quy trình phức tạp. Facade giấu đi sự phức tạp bên trong và cung cấp một điểm truy cập thân thiện cho client.

#### B. Vấn đề thực tế trong AITA
Tính năng **RAG (Retrieval-Augmented Generation)** để giải đáp thắc mắc tài liệu môn học là một chuỗi 6 bước kỹ thuật cực kỳ phức tạp:
1. Đọc file giáo trình (PDF/Word/Markdown).
2. Tách văn bản thành các chunks 500-1000 tokens kèm 10% overlap (`TextChunker`).
3. Tạo vector embeddings qua Embedding Model (`EmbeddingService`).
4. Ghi vector và metadata vào Vector DB Qdrant (`VectorStore`).
5. Khi sinh viên hỏi: Embed câu hỏi -> Cosine Similarity search Top-K ngữ cảnh liên quan.
6. Ráp ngữ cảnh vào System Prompt và gọi LLM sinh câu trả lời sư phạm.

Nếu để Controller trực tiếp điều phối 6 service này thì Controller sẽ phình to hàng trăm dòng code (vi phạm Fat Controller anti-pattern).

#### C. Giải pháp kiến trúc
Tạo `RagKnowledgeFacade` đóng gói toàn bộ quy trình RAG bên dưới. Controller chỉ cần gọi đúng 2 hàm: `ingestDocument()` và `queryKnowledge()`.

#### D. Minh họa mã nguồn (TypeScript)
```typescript
export class RagKnowledgeFacade {
  constructor(
    private docParser: DocumentParserService,
    private textSplitter: TextChunkerService,
    private embeddingService: EmbeddingService,
    private vectorDb: VectorDatabaseService,
    private llmProvider: ILlmProvider
  ) {}

  // Giảng viên nạp tài liệu: Toàn bộ quá trình chunking, embedding, lưu trữ được ẩn giấu
  async ingestDocument(courseId: string, fileBuffer: Buffer, fileName: string): Promise<void> {
    const rawText = await this.docParser.parse(fileBuffer, fileName);
    const chunks = this.textSplitter.chunk(rawText);
    const vectors = await this.embeddingService.embedBatch(chunks);
    await this.vectorDb.upsert(courseId, vectors);
  }

  // Sinh viên hỏi bài: Toàn bộ quá trình tìm kiếm ngữ cảnh tương đồng được gom lại
  async queryKnowledge(courseId: string, question: string): Promise<string> {
    const queryVector = await this.embeddingService.embed(question);
    const relevantChunks = await this.vectorDb.searchSimilar(courseId, queryVector, { topK: 3 });
    const prompt = `Dưới đây là giáo trình học phần:\n${relevantChunks.join('\n')}\nHãy trả lời câu hỏi: ${question}`;
    const result = await this.llmProvider.chat("Bạn là trợ giảng thông minh AITA...", prompt);
    return result.content;
  }
}
```

---

## 3. BEHAVIORAL PATTERNS (NHÓM MẪU HÀNH VI)

### 3.1. Strategy Pattern
#### A. Định nghĩa chuẩn (Definition)
> **Strategy** là mẫu thiết kế thuộc nhóm Hành vi (Behavioral), định nghĩa một họ các thuật toán (family of algorithms), đóng gói từng thuật toán vào một lớp riêng biệt và giúp các thuật toán này có thể hoán đổi cho nhau (interchangeable) trong lúc runtime. Strategy cho phép thuật toán biến đổi độc lập với client sử dụng nó.

#### B. Vấn đề thực tế trong AITA
Hệ thống AITA hỗ trợ 3 hình thức đánh giá sinh viên hoàn toàn khác biệt về mặt giải thuật:
1. `QUIZ`: So sánh trực tiếp key đáp án trắc nghiệm A, B, C, D (tính bằng milliseconds, không tốn tài nguyên).
2. `CODE_PE`: Đóng gói code vào Docker Sandbox, biên dịch gcc/javac, chạy testcase ẩn, đối chiếu output file (tốn CPU/RAM, chạy 2-5 giây).
3. `ESSAY`: Gửi bài viết và bảng barem điểm (Rubric) cho AI phân tích chiều sâu lập luận (tốn API Token, chạy 5-10 giây).

Nếu gom chung vào một hàm `gradeSubmission()` với hàng loạt cờ kiểm tra thì code sẽ cực kỳ rườm rà và khó bảo trì.

#### C. Giải pháp kiến trúc
Tạo interface `IGradingStrategy` với phương thức `grade()`. Mỗi hình thức bài tập là một Strategy độc lập: `QuizGradingStrategy`, `CodeSandboxGradingStrategy`, `EssayAiGradingStrategy`.

#### D. Minh họa mã nguồn (TypeScript)
```typescript
// 1. Strategy Interface
export interface IGradingStrategy {
  grade(submission: SubmissionData, criteria: any): Promise<GradingResult>;
}

// 2. Chiến lược 1: Chấm trắc nghiệm
export class QuizGradingStrategy implements IGradingStrategy {
  async grade(submission: SubmissionData, answerKeys: any): Promise<GradingResult> {
    const score = compareAnswers(submission.answers, answerKeys);
    return { score, feedback: 'Chấm trắc nghiệm tự động hoàn tất.' };
  }
}

// 3. Chiến lược 2: Chấm bài thi code thực hành (PE)
export class CodeSandboxGradingStrategy implements IGradingStrategy {
  async grade(submission: SubmissionData, testcases: any): Promise<GradingResult> {
    const runner = SandboxRunnerFactory.createRunner(submission.language);
    return await runner.run(submission.codePath, testcases);
  }
}

// 4. Chiến lược 3: Chấm tự luận bằng AI theo Rubric
export class EssayAiGradingStrategy implements IGradingStrategy {
  async grade(submission: SubmissionData, rubric: any): Promise<GradingResult> {
    return await evaluateEssayWithRubric(submission.content, rubric);
  }
}

// 5. Context Class: Điều phối chiến lược
export class GradingContext {
  private strategy: IGradingStrategy;

  constructor(strategy: IGradingStrategy) {
    this.strategy = strategy;
  }

  public setStrategy(strategy: IGradingStrategy) {
    this.strategy = strategy;
  }

  public async execute(sub: SubmissionData, criteria: any): Promise<GradingResult> {
    return this.strategy.grade(sub, criteria);
  }
}
```

---

### 3.2. Observer Pattern (kết hợp Event-Driven / Pub-Sub)
#### A. Định nghĩa chuẩn (Definition)
> **Observer** là mẫu thiết kế thuộc nhóm Hành vi (Behavioral), định nghĩa mối phụ thuộc một-nhiều (one-to-many dependency) giữa các đối tượng. Khi một đối tượng (gọi là **Subject** hoặc Publisher) thay đổi trạng thái, tất cả các đối tượng đăng ký theo dõi nó (gọi là **Observers** hoặc Subscribers) sẽ tự động được thông báo và cập nhật.

#### B. Vấn đề thực tế trong AITA
Việc chấm bài thi Code trong Docker Sandbox hoặc chạy RAG mất từ 5 đến 30 giây. Máy chủ không thể giữ kết nối HTTP Request đồng bộ vì trình duyệt sẽ bị treo (timeout). Do đó, tiến trình chấm được đẩy vào hàng đợi ngầm (Queue Worker). Khi worker hoàn thành chấm điểm, làm thế nào để đồng thời:
1. Cập nhật trạng thái điểm vào CSDL MySQL?
2. Bắn thông báo thời gian thực về màn hình sinh viên qua WebSocket/SSE?
3. Gửi cảnh báo gian lận cho Giảng viên nếu phát hiện bài làm bất thường?

#### C. Giải pháp kiến trúc
Áp dụng **Observer Pattern**: Khi `GradingWorker` xử lý xong một `GradingJob`, nó phát sự kiện thông báo. Các thành phần quan sát (`WebSocketNotificationObserver`, `FraudAuditObserver`, `EmailNotificationObserver`) sẽ tự động đón nhận sự kiện và xử lý công việc độc lập mà không can thiệp vào Worker.

#### D. Minh họa mã nguồn (TypeScript)
```typescript
export type JobObserver = (jobId: string, result: GradingResult) => Promise<void>;

export class JobStatusSubject {
  private observers: JobObserver[] = [];

  // Đăng ký người quan sát mới
  public attach(observer: JobObserver): void {
    this.observers.push(observer);
  }

  // Thông báo tới tất cả người quan sát khi trạng thái thay đổi
  public async notify(jobId: string, result: GradingResult): Promise<void> {
    for (const observer of this.observers) {
      await observer(jobId, result);
    }
  }
}

// Ứng dụng thực tế khi khởi động Server:
const jobSubject = new JobStatusSubject();

// Observer 1: Đẩy điểm ngay lập tức lên giao diện Next.js qua WebSocket
jobSubject.attach(async (jobId, result) => {
  socketGateway.sendToStudent(result.studentId, 'GRADING_FINISHED', result);
});

// Observer 2: Ghi log kiểm toán (Audit Trail)
jobSubject.attach(async (jobId, result) => {
  auditLogger.log(`Job ${jobId} hoàn thành với số điểm: ${result.score}`);
});
```

---

### 3.3. Template Method Pattern
#### A. Định nghĩa chuẩn (Definition)
> **Template Method** là mẫu thiết kế thuộc nhóm Hành vi (Behavioral), định nghĩa bộ khung thuật toán (skeleton of an algorithm) trong một phương thức của lớp cha, nhưng trì hoãn việc định nghĩa một số bước cụ thể cho các lớp con. Template Method cho phép các lớp con thay đổi một số bước nhất định mà **không làm thay đổi cấu trúc tổng thể** của thuật toán.

#### B. Vấn đề thực tế trong AITA
Quy trình thực thi và kiểm thử code an toàn trong Docker Sandbox luôn cố định 5 bước tuần tự:
1. `prepareWorkspace()`: Tạo thư mục cô lập tạm thời `/tmp/sandbox-...`
2. `compile()`: Bước biên dịch (C cần gcc, Java cần javac, Python là thông dịch nên bỏ qua).
3. `executeTestCases()`: Chạy testcase với giới hạn cgroups CPU & RAM.
4. `evaluateOutputs()`: So khớp chuỗi output thực tế với output chuẩn.
5. `cleanup()`: Xóa sạch thư mục tạm và hủy container để chống cạn kiệt ổ cứng.

Nếu mỗi ngôn ngữ tự viết lại toàn bộ luồng này thì rất dễ xảy ra lỗi quên dọn dẹp thư mục tạm (`cleanup()`), dẫn đến rò rỉ bộ nhớ đĩa.

#### C. Giải pháp kiến trúc
Lớp abstract `BaseSandboxRunner` định nghĩa phương thức mẫu `executePipeline()` cố định luồng 5 bước này. Các lớp con (`JavaRunner`, `CppRunner`) chỉ việc hiện thực hóa các bước đặc thù như `compile()` hay `runTestCasesWithLimits()`.

#### D. Minh họa mã nguồn (TypeScript)
```typescript
export abstract class BaseSandboxRunner {
  // Template Method: Khóa chặt quy trình thực thi, đảm bảo luôn luôn gọi cleanup()
  public async executePipeline(submissionPath: string, testcases: TestCase[]): Promise<TestRunResult> {
    const workspace = await this.prepareWorkspace(submissionPath);
    try {
      await this.compile(workspace); // Hook bước biên dịch
      const rawOutputs = await this.runTestCasesWithLimits(workspace, testcases);
      return this.evaluateOutputs(rawOutputs, testcases);
    } finally {
      await this.cleanup(workspace); // Bắt buộc thực thi dọn dẹp trong mọi tình huống
    }
  }

  protected async prepareWorkspace(path: string): Promise<string> {
    return `/tmp/sandbox-${Date.now()}`;
  }

  // Các phương thức trừu tượng để lớp con tự hiện thực hóa
  protected abstract compile(workspace: string): Promise<void>;
  protected abstract runTestCasesWithLimits(workspace: string, testcases: TestCase[]): Promise<any>;

  protected evaluateOutputs(actual: any, expected: any): TestRunResult {
    // Thuật toán so khớp chuỗi dùng chung (xóa khoảng trắng thừa CRLF/LF)
    return { passedCount: 10, totalCount: 10, score: 10 };
  }

  protected async cleanup(workspace: string): Promise<void> {
    // Xóa thư mục tạm thời khỏi hệ thống máy chủ
  }
}
```

---

## 4. ENTERPRISE & ARCHITECTURAL PATTERNS

### 4.1. Repository Pattern
#### A. Định nghĩa chuẩn (Definition)
> **Repository Pattern** là mẫu thiết kế kiến trúc đóng vai trò là một lớp trung gian (mediator) giữa tầng Nghiệp vụ (Domain/Business Logic) và tầng Ánh xạ Dữ liệu (Data Mapping/Database Engine). Repository cung cấp một giao diện giống như một tập hợp đối tượng trong bộ nhớ (collection-like interface) để thực hiện các thao tác CRUD.

#### B. Ứng dụng trong AITA
Toàn bộ mã nguồn Service (như `AssignmentService`, `UserService`) hoàn toàn không viết các câu truy vấn Prisma trực tiếp. Mọi thao tác đều thông qua các class Repository như `UserRepository`, `SubmissionRepository`.
* **Lợi ích khi bảo vệ đồ án:** Thể hiện việc tuân thủ nguyên lý **DIP (Dependency Inversion)**. Khi viết Unit Test cho Service, ta chỉ cần Mock Repository mà không cần dựng Database MySQL thật. Nếu tương lai chuyển sang TypeORM hoặc MongoDB, toàn bộ logic nghiệp vụ giữ nguyên 100%.

---

### 4.2. Dependency Injection (DI) & Inversion of Control (IoC)
#### A. Định nghĩa chuẩn (Definition)
> **Inversion of Control (IoC)** là một nguyên lý kiến trúc trong đó luồng điều khiển của ứng dụng bị đảo ngược: thay vì code của bạn tự kiểm soát việc tạo và gọi các đối tượng khác, một framework hoặc container bên ngoài sẽ kiểm soát điều đó.  
> **Dependency Injection (DI)** là mẫu thiết kế cụ thể để thực hiện hóa IoC, trong đó các đối tượng phụ thuộc (dependencies) được "tiêm" (inject) vào một đối tượng từ bên ngoài (thông qua Constructor hoặc Setter), thay vì đối tượng đó tự tạo mới bằng từ khóa `new`.

#### B. Ứng dụng trong AITA
AITA áp dụng **Constructor Injection** xuyên suốt cả 3 tầng kiến trúc:
```
Controller (nhận Service qua Constructor) 
  ↳ Service (nhận Repository và Provider qua Constructor) 
      ↳ Repository (nhận PrismaClient qua Constructor)
```

---

## 5. BẢNG ĐỐI CHIẾU TIÊU CHÍ ĐÁNH GIÁ ĐỒ ÁN SWD392

Khi Hội đồng Giảng viên hỏi: *"Dự án của bạn áp dụng những Design Patterns nào, định nghĩa là gì, tại sao lại dùng và mang lại lợi ích gì?"*, nhóm sinh viên có thể tự tin phản biện theo bảng chuẩn sau:

| Câu hỏi phản biện từ Giảng viên | Mẫu thiết kế liên quan | Câu trả lời trọng tâm (Key Defense Points) |
| :--- | :--- | :--- |
| **"Em hiểu Design Pattern là gì? Tại sao không viết hàm bình thường mà phải vẽ ra pattern?"** | **Tổng quan Design Patterns** | Design Pattern là các mẫu thiết kế hướng đối tượng đã được chuẩn hóa (GoF) giúp giải quyết các bài toán tái cấu trúc và mở rộng. Nếu viết hàm thủ công thì khi dự án phình to, code sẽ bị rối (Spaghetti code), vi phạm các nguyên lý SOLID và rất khó viết Unit Test độc lập. |
| **"Làm sao hệ thống hỗ trợ thêm môn thi C# hoặc Go mà không sửa code cũ?"** | **Factory Method + Template Method** | Áp dụng Factory Method và Template Method: Chỉ cần tạo class `CSharpRunner` kế thừa `BaseSandboxRunner` và đăng ký vào `SandboxRunnerFactory`. Giữ nguyên 100% logic Controller và Service cũ (chuẩn OCP). |
| **"Nếu Google Gemini tính tiền đắt hoặc bị sập mạng thì hệ thống xử lý thế nào?"** | **Adapter Pattern** | Toàn bộ LLM đã được bọc qua interface `ILlmProvider`. Khi có sự cố, hệ thống chỉ cần thay đổi cấu hình nạp `OpenAIAdapter` hoặc `ClaudeAdapter` mà không phải sửa lại code gọi AI trong Service. |
| **"Quy trình RAG rất nhiều bước, làm sao để code controller không bị phình to?"** | **Facade Pattern** | `RagKnowledgeFacade` đóng vai trò là giao diện đơn giản hóa che giấu 6 bước phức tạp của Vector DB, Embedding và Chunking. Controller chỉ cần tương tác qua đúng 1 phương thức duy nhất `queryKnowledge()`. |
| **"Hệ thống có cơ chế gì để chấm trắc nghiệm và chấm code khác nhau?"** | **Strategy Pattern** | Sử dụng `GradingStrategy`. Mỗi hình thức bài tập (Quiz, Code, Essay) là một chiến lược thuật toán độc lập, cho phép linh hoạt hoán đổi trong lúc runtime mà không cần lồng ghép các khối `switch-case` phức tạp. |
| **"Làm sao tránh sập Database khi hàng trăm sinh viên cùng nộp bài PE?"** | **Singleton + Observer (Queue)** | PrismaClient dùng Singleton để giữ connection pool ổn định ở mức giới hạn an toàn. Việc chấm bài được đẩy vào Background Queue với Observer Pattern bắn kết quả về qua WebSocket, không chặn luồng server. |
