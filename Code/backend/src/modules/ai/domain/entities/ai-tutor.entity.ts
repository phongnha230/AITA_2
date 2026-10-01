export type ConversationStatus = 'ACTIVE' | 'CLOSED';
export type MessageSenderRole = 'USER' | 'MODEL' | 'SYSTEM';

export interface AiTutorMessageProps {
  id: string;
  conversationId: string;
  senderRole: MessageSenderRole;
  content: string;
  hasLeakageDetected: boolean;
  tokenCount: number;
  createdAt: Date;
}

export class AiTutorMessage {
  constructor(private readonly props: AiTutorMessageProps) {}

  get id(): string {
    return this.props.id;
  }

  get conversationId(): string {
    return this.props.conversationId;
  }

  get senderRole(): MessageSenderRole {
    return this.props.senderRole;
  }

  get content(): string {
    return this.props.content;
  }

  get hasLeakageDetected(): boolean {
    return this.props.hasLeakageDetected;
  }

  get tokenCount(): number {
    return this.props.tokenCount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toJSON() {
    return {
      id: this.props.id,
      conversationId: this.props.conversationId,
      senderRole: this.props.senderRole,
      content: this.props.content,
      hasLeakageDetected: this.props.hasLeakageDetected,
      tokenCount: this.props.tokenCount,
      createdAt: this.props.createdAt,
    };
  }
}

export interface AiTutorConversationProps {
  id: string;
  submissionId: string;
  studentId: string;
  title: string;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
  messages?: AiTutorMessage[];
}

export class AiTutorConversation {
  constructor(private readonly props: AiTutorConversationProps) {}

  get id(): string {
    return this.props.id;
  }

  get submissionId(): string {
    return this.props.submissionId;
  }

  get studentId(): string {
    return this.props.studentId;
  }

  get title(): string {
    return this.props.title;
  }

  get status(): ConversationStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get messages(): AiTutorMessage[] | undefined {
    return this.props.messages;
  }

  toJSON() {
    return {
      id: this.props.id,
      submissionId: this.props.submissionId,
      studentId: this.props.studentId,
      title: this.props.title,
      status: this.props.status,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      messages: this.props.messages?.map((m) => m.toJSON()),
    };
  }
}
