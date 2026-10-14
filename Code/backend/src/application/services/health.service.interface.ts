export interface HealthSnapshot {
  status: 'UP' | 'DEGRADED';
  timestamp: string;
  services: {
    server: 'HEALTHY';
    database: 'CONNECTED' | 'DISCONNECTED';
    redis: 'CONNECTED' | 'DISCONNECTED' | 'UNEXPECTED_RESPONSE';
  };
}

export interface IHealthService {
  check(): Promise<HealthSnapshot>;
}
