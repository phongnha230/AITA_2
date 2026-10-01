export type ApiProvider = 'GEMINI' | 'OPENAI';

export interface AiApiKeyProps {
  id: string;
  provider: ApiProvider;
  keyAlias: string;
  keyHint: string;
  encryptedSecret: string;
  iv: string;
  authTag: string;
  dailyRequestLimit: number;
  currentRequestsToday: number;
  rpmLimit: number;
  consecutiveFailures: number;
  isActive: boolean;
  lastUsedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class AiApiKey {
  constructor(private readonly props: AiApiKeyProps) {}

  get id(): string {
    return this.props.id;
  }

  get provider(): ApiProvider {
    return this.props.provider;
  }

  get keyAlias(): string {
    return this.props.keyAlias;
  }

  get keyHint(): string {
    return this.props.keyHint;
  }

  get encryptedSecret(): string {
    return this.props.encryptedSecret;
  }

  get iv(): string {
    return this.props.iv;
  }

  get authTag(): string {
    return this.props.authTag;
  }

  get dailyRequestLimit(): number {
    return this.props.dailyRequestLimit;
  }

  get currentRequestsToday(): number {
    return this.props.currentRequestsToday;
  }

  get rpmLimit(): number {
    return this.props.rpmLimit;
  }

  get consecutiveFailures(): number {
    return this.props.consecutiveFailures;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get lastUsedAt(): Date | null | undefined {
    return this.props.lastUsedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public isAvailable(): boolean {
    return (
      this.props.isActive &&
      this.props.currentRequestsToday < this.props.dailyRequestLimit &&
      this.props.consecutiveFailures < 3
    );
  }

  toJSON() {
    return {
      id: this.props.id,
      provider: this.props.provider,
      keyAlias: this.props.keyAlias,
      keyHint: this.props.keyHint,
      dailyRequestLimit: this.props.dailyRequestLimit,
      currentRequestsToday: this.props.currentRequestsToday,
      rpmLimit: this.props.rpmLimit,
      consecutiveFailures: this.props.consecutiveFailures,
      isActive: this.props.isActive,
      lastUsedAt: this.props.lastUsedAt,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
