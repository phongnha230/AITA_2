export interface HealthSnapshot {
  status: 'UP' | 'DEGRADED';
  timestamp: string;
  services: {
    server: 'HEALTHY';
    database: 'CONNECTED' | 'DISCONNECTED';
    redis: 'CONNECTED' | 'DISCONNECTED' | 'UNEXPECTED_RESPONSE';
    fer201: 'DISABLED' | 'READY' | 'NOT_READY';
    chromium: 'AVAILABLE' | 'UNAVAILABLE';
    ai: 'CONFIGURED' | 'MISSING_KEY';
    fer201Migration: 'APPLIED' | 'MISSING';
  };
}

export interface IHealthService {
  check(): Promise<HealthSnapshot>;
}
