import { IAiTutorRepository } from '../../domain/repositories/ai-tutor.repository.interface.js';
import { ISubmissionRepository } from '../../../submission/domain/repositories/submission.repository.interface.js';
import { IAiGenerationService } from '../services/ai-generation.service.interface.js';
import { SocraticTutorPrompt } from '../../infrastructure/prompts/socratic-tutor.prompt.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { SourceCollector } from '../services/source-collector.service.js';
import { DEFAULT_AI_TUTOR_CONFIG } from '../../domain/ai-tutor-config.js';

const MAX_USER_MESSAGE_LENGTH = 4_000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_HISTORY_CHARACTERS = 24_000;

function selectBoundedHistory(
  messages: Array<{ senderRole: string; content: string }>
): Array<{ role: string; content: string }> {
  const selected: Array<{ role: string; content: string }> = [];
  let characters = 0;
  for (const message of messages.slice(-MAX_HISTORY_MESSAGES).reverse()) {
    if (characters + message.content.length > MAX_HISTORY_CHARACTERS) break;
    selected.push({ role: message.senderRole, content: message.content });
    characters += message.content.length;
  }
  return selected.reverse();
}

export class SendTutorMessageUseCase {
  constructor(
    private readonly aiTutorRepository: IAiTutorRepository,
    private readonly submissionRepository: ISubmissionRepository,
    private readonly aiGenerationService: IAiGenerationService,
    private readonly sourceCollector = new SourceCollector()
  ) {}

  public async execute(conversationId: string, studentId: string, userMessageContent: string) {
    if (userMessageContent.length > MAX_USER_MESSAGE_LENGTH) {
      throw new ValidationError('Tin nhắn tutor không được vượt quá 4.000 ký tự.');
    }
    const conversation = await this.aiTutorRepository.findConversationById(conversationId);
    if (!conversation) throw new NotFoundError(`Cuộc trò chuyện với ID: ${conversationId}`);
    if (conversation.studentId !== studentId) {
      throw new ForbiddenError('Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này.');
    }
    if (conversation.status === 'CLOSED') throw new ValidationError('Phiên trò chuyện này đã kết thúc.');

    const submission = await this.submissionRepository.findWithJobStatus(conversation.submissionId);
    let studentCode = '// Không tìm thấy mã nguồn';
    if (submission?.zipFilePath) {
      const environment = submission.assignment?.environment;
      if (environment !== 'C_GCC' && environment !== 'JAVA_JDK') {
        throw new ValidationError('Không xác định được ngôn ngữ của assignment để đọc source.');
      }
      const collectedSource = await this.sourceCollector.collect(submission.zipFilePath, environment);
      if (collectedSource.files.length > 0) studentCode = collectedSource.combinedSource;
    }

    const testResults = (submission?.testResults ?? []) as Array<{ verdict: string }>;
    const passedCount = testResults.filter((result) => result.verdict === 'PASSED').length;
    const failedCount = testResults.length - passedCount;
    const testSummary = testResults.length === 0
      ? 'Chưa có kết quả chạy testcase.'
      : `Tổng ${testResults.length} testcase; ${passedCount} đạt, ${failedCount} chưa đạt. Không cung cấp tên, input, expected output hoặc log testcase.`;
    const courseId = submission?.assignment?.courseId;
    const config = courseId
      ? (await this.aiTutorRepository.getCourseTutorConfig(courseId) ?? { ...DEFAULT_AI_TUTOR_CONFIG, courseId })
      : DEFAULT_AI_TUTOR_CONFIG;
    const assignmentContext = config.enableContext && submission?.assignment
      ? await this.aiTutorRepository.getTutorAssignmentContext(submission.assignment.id, courseId ?? '')
      : null;

    const allMessages = await this.aiTutorRepository.getMessages(conversationId);
    const history = selectBoundedHistory(allMessages);
    const llmResponse = await this.aiGenerationService.executeWithKeyRotation(
      SocraticTutorPrompt.buildConversationPrompt(
        studentCode,
        testSummary,
        history,
        userMessageContent,
        assignmentContext
      ),
      {
        operation: 'CHAT_GENERATION',
        systemInstruction: SocraticTutorPrompt.buildSystemInstruction(config),
        temperature: config.temperature,
        jsonMode: false,
      }
    );

    const hasLeakageDetected = [...llmResponse.text.matchAll(/```[\s\S]*?```/g)]
      .some((match) => match[0].split(/\r?\n/).length - 2 > 10);
    const saved = await this.aiTutorRepository.addMessagePair({
      conversationId,
      userContent: userMessageContent,
      modelContent: llmResponse.text,
      hasLeakageDetected,
      modelTokenCount: llmResponse.tokensConsumed ?? 0,
    });

    return {
      conversationId,
      studentMessage: saved.userMessage.toJSON(),
      aiReply: saved.modelMessage.toJSON(),
    };
  }
}
