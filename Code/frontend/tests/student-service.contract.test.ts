import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api } = vi.hoisted(() => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/api', () => ({ default: api }));

const { studentService } = await import('../src/features/student/services/student.service');

describe('studentService API contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps the backend tutor message pair to the assistant message used by the UI', async () => {
    api.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          conversationId: 'conversation-1',
          studentMessage: {
            id: 'message-user',
            senderRole: 'USER',
            content: 'Why does this fail?',
          },
          aiReply: {
            id: 'message-model',
            senderRole: 'MODEL',
            content: 'Check the loop boundary.',
          },
        },
      },
    });

    await expect(
      studentService.sendTutorMessage('conversation-1', 'Why does this fail?')
    ).resolves.toEqual({
      id: 'message-model',
      role: 'ASSISTANT',
      content: 'Check the loop boundary.',
      createdAt: undefined,
    });
    expect(api.post).toHaveBeenCalledWith(
      '/ai/tutor/conversations/conversation-1/messages',
      { content: 'Why does this fail?' }
    );
  });

  it('normalizes senderRole in tutor history', async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          id: 'conversation-1',
          submissionId: 'submission-1',
          title: 'Debug',
          status: 'ACTIVE',
          messages: [
            { id: 'u1', senderRole: 'USER', content: 'Question' },
            { id: 'm1', senderRole: 'MODEL', content: 'Hint' },
          ],
        },
      },
    });

    const conversation = await studentService.getTutorConversation('conversation-1');

    expect(conversation.messages.map((message) => message.role)).toEqual(['USER', 'ASSISTANT']);
  });

  it('uses the minimal public sandbox health endpoint', async () => {
    api.get.mockResolvedValue({ data: { status: 'ready' } });

    await expect(studentService.getSandboxHealth()).resolves.toEqual({ status: 'ready' });
    expect(api.get).toHaveBeenCalledWith('/sandbox/health');
  });

  it('opens a student exam session with the access code and reads its server state', async () => {
    const session = {
      assignmentId: 'assignment-1', status: 'UPCOMING', assignmentStatus: 'PUBLISHED',
      startTime: '2026-10-17T10:00:00.000Z', deadline: '2026-10-17T11:00:00.000Z', durationMinutes: 60,
    };
    api.post.mockResolvedValue({ data: { data: session } });
    api.get.mockResolvedValue({ data: { data: session } });

    await expect(studentService.unlockExam('assignment-1', 'PE-2026')).resolves.toEqual(session);
    await expect(studentService.getExamSession('assignment-1')).resolves.toEqual(session);
    expect(api.post).toHaveBeenCalledWith('/assignments/assignment-1/unlock', { accessCode: 'PE-2026' });
    expect(api.get).toHaveBeenCalledWith('/assignments/assignment-1/session');
  });

  it('downloads the real PDF through the protected assignment file endpoint', async () => {
    const pdf = new Blob(['pdf-data'], { type: 'application/pdf' });
    api.get.mockResolvedValue({ data: pdf });

    await expect(studentService.downloadExamPdf('assignment-1')).resolves.toBe(pdf);
    expect(api.get).toHaveBeenCalledWith('/assignments/assignment-1/files/pdf', { responseType: 'blob' });
  });
});
