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
});
