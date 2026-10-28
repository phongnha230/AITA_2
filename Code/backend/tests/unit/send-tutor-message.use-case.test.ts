import { describe, expect, it, vi } from 'vitest';
import { SendTutorMessageUseCase } from '../../src/modules/ai/application/use-cases/send-tutor-message.use-case.js';

const savedMessage = { toJSON: () => ({ id: 'message-1', content: 'ok' }) };

describe('SendTutorMessageUseCase configuration and safe context', () => {
  it('uses the course policy and only adds assignment text and rubric when enabled', async () => {
    const conversation = { studentId: 'student-1', submissionId: 'submission-1', status: 'ACTIVE' };
    const tutorRepository = {
      findConversationById: vi.fn().mockResolvedValue(conversation),
      getCourseTutorConfig: vi.fn().mockResolvedValue({
        courseId: 'course-1', socraticMode: 'LENIENT', customPrompt: 'Gợi ý bằng pseudo-code.', temperature: 0.45, enableContext: true,
      }),
      getTutorAssignmentContext: vi.fn().mockResolvedValue({
        title: 'Array sum', description: 'Calculate a sum.', rubricRules: [{ criterionName: 'Algorithm', description: 'Linear pass', maxPoints: 2 }],
      }),
      getMessages: vi.fn().mockResolvedValue([]),
      addMessagePair: vi.fn().mockResolvedValue({ userMessage: savedMessage, modelMessage: savedMessage }),
    };
    const submissionRepository = {
      findWithJobStatus: vi.fn().mockResolvedValue({
        zipFilePath: null,
        assignment: { id: 'assignment-1', courseId: 'course-1', environment: 'C_GCC' },
        testResults: [{ verdict: 'WRONG_ANSWER', testCase: { label: 'secret case' }, diffLog: 'private expected output' }],
      }),
    };
    const aiGeneration = { executeWithKeyRotation: vi.fn().mockResolvedValue({ text: 'Hãy thử kiểm tra vòng lặp.', tokensConsumed: 8 }) };
    const useCase = new SendTutorMessageUseCase(
      tutorRepository as never,
      submissionRepository as never,
      aiGeneration as never,
    );

    await useCase.execute('conversation-1', 'student-1', 'Tại sao sai?');
    const [prompt, options] = aiGeneration.executeWithKeyRotation.mock.calls[0] as [string, { systemInstruction: string; temperature: number }];
    expect(options.temperature).toBe(0.45);
    expect(options.systemInstruction).toContain('Quy trình phản hồi chuẩn 3 bước');
    expect(options.systemInstruction).toContain('Gợi ý bằng pseudo-code.');
    expect(prompt).toContain('Calculate a sum.');
    expect(prompt).toContain('Linear pass');
    expect(prompt).toContain('1 chưa đạt');
    expect(prompt).not.toContain('secret case');
    expect(prompt).not.toContain('private expected output');
  });

  it('does not fetch assignment RAG context when the course config disables it', async () => {
    const tutorRepository = {
      findConversationById: vi.fn().mockResolvedValue({ studentId: 'student-1', submissionId: 'submission-1', status: 'ACTIVE' }),
      getCourseTutorConfig: vi.fn().mockResolvedValue({ courseId: 'course-1', socraticMode: 'STRICT', customPrompt: '', temperature: 0.2, enableContext: false }),
      getTutorAssignmentContext: vi.fn(),
      getMessages: vi.fn().mockResolvedValue([]),
      addMessagePair: vi.fn().mockResolvedValue({ userMessage: savedMessage, modelMessage: savedMessage }),
    };
    const submissionRepository = {
      findWithJobStatus: vi.fn().mockResolvedValue({ zipFilePath: null, assignment: { id: 'assignment-1', courseId: 'course-1', environment: 'C_GCC' }, testResults: [] }),
    };
    const aiGeneration = { executeWithKeyRotation: vi.fn().mockResolvedValue({ text: 'Bạn thử xem lại điều kiện dừng?', tokensConsumed: 4 }) };
    const useCase = new SendTutorMessageUseCase(tutorRepository as never, submissionRepository as never, aiGeneration as never);

    await useCase.execute('conversation-1', 'student-1', 'Em sai đâu?');
    const [prompt, options] = aiGeneration.executeWithKeyRotation.mock.calls[0] as [string, { systemInstruction: string }];
    expect(tutorRepository.getTutorAssignmentContext).not.toHaveBeenCalled();
    expect(prompt).not.toContain('UNTRUSTED_ASSIGNMENT_CONTEXT');
    expect(options.systemInstruction).toContain('Quy trình phản hồi chuẩn 3 bước');
  });
});
