import fs from 'fs';
import path from 'path';
import { IAiTutorRepository } from '../../domain/repositories/ai-tutor.repository.interface.js';
import { ISubmissionRepository } from '../../../submission/domain/repositories/submission.repository.interface.js';
import { ApiKeyRotatorFacade } from '../../infrastructure/facades/api-key-rotator.facade.js';
import { SocraticTutorPrompt } from '../../infrastructure/prompts/socratic-tutor.prompt.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

export class SendTutorMessageUseCase {
  constructor(
    private readonly aiTutorRepository: IAiTutorRepository,
    private readonly submissionRepository: ISubmissionRepository,
    private readonly apiKeyRotatorFacade: ApiKeyRotatorFacade
  ) {}

  public async execute(conversationId: string, studentId: string, userMessageContent: string) {
    const conversation = await this.aiTutorRepository.findConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundError(`Cuộc trò chuyện với ID: ${conversationId}`);
    }

    if (conversation.studentId !== studentId) {
      throw new ForbiddenError('Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này.');
    }

    if (conversation.status === 'CLOSED') {
      throw new ValidationError('Phiên trò chuyện này đã kết thúc.');
    }

    // 1. Lưu tin nhắn của sinh viên
    await this.aiTutorRepository.addMessage({
      conversationId,
      senderRole: 'USER',
      content: userMessageContent,
    });

    // 2. Lấy thông tin bài nộp & các testcase bị lỗi thông qua repository
    const submission = await this.submissionRepository.findWithJobStatus(conversation.submissionId);

    let studentCode = '// Không tìm thấy mã nguồn';
    if (submission?.zipFilePath && fs.existsSync(submission.zipFilePath)) {
      try {
        const files = this.collectSourceFiles(submission.zipFilePath);
        if (files.length > 0) {
          studentCode = files
            .map((f) => `// File: ${path.relative(submission.zipFilePath!, f)}\n${fs.readFileSync(f, 'utf-8')}`)
            .join('\n\n');
        }
      } catch (err: any) {
        console.warn('[SendTutorMessageUseCase] Failed to read source files ->', err.message);
      }
    }

    const testResults = (submission?.testResults || []).filter((tr: any) => tr.verdict !== 'PASSED');
    const failedTests = testResults.length > 0
      ? testResults
          .map(
            (tr: any) =>
              `- Test ${tr.testCase?.label || tr.testCaseId} (${tr.testCase?.rationaleTag || 'TEST'}): Kết quả ${tr.verdict}. ${tr.diffLog || ''}`
          )
          .join('\n')
      : 'Không có testcase lỗi.';

    // 3. Lấy lịch sử tin nhắn
    const allMessages = await this.aiTutorRepository.getMessages(conversationId);
    const history = allMessages.slice(0, -1).map((m: any) => ({
      role: m.senderRole,
      content: m.content,
    }));

    // 4. Lắp ráp Prompt và gọi AI Socrates
    const systemInstruction = SocraticTutorPrompt.buildSystemInstruction();
    const prompt = SocraticTutorPrompt.buildConversationPrompt(
      studentCode,
      failedTests,
      history,
      userMessageContent
    );

    const llmResponse = await this.apiKeyRotatorFacade.executeWithKeyRotation(prompt, {
      systemInstruction,
      temperature: 0.7,
      jsonMode: false,
    });

    // 5. Kiểm tra rò rỉ mã nguồn (Code leakage guardrail)
    const hasLeakageDetected = this.detectCodeLeakage(llmResponse.text);

    // 6. Lưu phản hồi của AI
    const aiMessage = await this.aiTutorRepository.addMessage({
      conversationId,
      senderRole: 'MODEL',
      content: llmResponse.text,
      hasLeakageDetected,
      tokenCount: llmResponse.tokensConsumed || 0,
    });

    return {
      conversationId,
      studentMessage: userMessageContent,
      aiReply: aiMessage.toJSON(),
    };
  }

  private detectCodeLeakage(text: string): boolean {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const matches = text.match(codeBlockRegex);
    if (!matches) return false;

    return matches.some((block) => block.split('\n').length > 10);
  }

  private collectSourceFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory() && file !== 'bin' && file !== '__MACOSX') {
        results = results.concat(this.collectSourceFiles(fullPath));
      } else if (file.endsWith('.c') || file.endsWith('.java') || file.endsWith('.cpp')) {
        results.push(fullPath);
      }
    }
    return results;
  }
}
