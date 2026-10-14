export type ApiProvider = 'GEMINI' | 'OPENAI';
export type AiKeyAvailabilityStatus = 'AVAILABLE' | 'COOLDOWN' | 'QUOTA_EXHAUSTED' | 'DISABLED';

export interface AiApiKeyProps {
  id: string;
  provider: ApiProvider;
  keyAlias: string;
  keyHint: string;
  encryptedSecret: string;
  iv: string;
  authTag: string;
  encryptionVersion: number;
  dailyRequestLimit: number;
  currentRequestsToday: number;
  usageDate?: Date | null;
  rpmLimit: number;
  consecutiveFailures: number;
  isActive: boolean;
  cooldownUntil?: Date | null;
  lastErrorCode?: string | null;
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

  get encryptionVersion(): number {
    return this.props.encryptionVersion;
  }

  get dailyRequestLimit(): number {
    return this.props.dailyRequestLimit;
  }

  get currentRequestsToday(): number {
    return this.isUsageFromToday() ? this.props.currentRequestsToday : 0;
  }

  get usageDate(): Date | null | undefined {
    return this.props.usageDate;
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

  get cooldownUntil(): Date | null | undefined {
    return this.props.cooldownUntil;
  }

  get lastErrorCode(): string | null | undefined {
    return this.props.lastErrorCode;
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

  private isUsageFromToday(now: Date = new Date()): boolean {
    if (!this.props.usageDate) return false;
    return this.props.usageDate.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
  }

  public availabilityStatus(now: Date = new Date()): AiKeyAvailabilityStatus {
    if (this.props.provider !== 'GEMINI') return 'DISABLED';
    if (!this.props.isActive) return 'DISABLED';
    if (this.props.cooldownUntil && this.props.cooldownUntil > now) return 'COOLDOWN';
    if (this.currentRequestsToday >= this.props.dailyRequestLimit) return 'QUOTA_EXHAUSTED';
    return 'AVAILABLE';
  }

  public isAvailable(now: Date = new Date()): boolean {
    return this.availabilityStatus(now) === 'AVAILABLE';
  }

  toJSON() {
    return {
      id: this.props.id,
      provider: this.props.provider,
      keyAlias: this.props.keyAlias,
      keyHint: this.props.keyHint,
      source: 'DASHBOARD' as const,
      dailyRequestLimit: this.props.dailyRequestLimit,
      currentRequestsToday: this.currentRequestsToday,
      usageDate: this.props.usageDate,
      rpmLimit: this.props.rpmLimit,
      consecutiveFailures: this.props.consecutiveFailures,
      isActive: this.props.isActive,
      cooldownUntil: this.props.cooldownUntil,
      lastErrorCode: this.props.lastErrorCode,
      availabilityStatus: this.availabilityStatus(),
      lastUsedAt: this.props.lastUsedAt,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
