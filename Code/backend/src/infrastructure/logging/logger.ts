type LogLevel = 'info' | 'warn' | 'error';

const sensitiveKeyPattern = /(authorization|cookie|password|secret|token|otp|source|solution|credential)/i;

function sanitize(value: unknown, key = ''): unknown {
  if (sensitiveKeyPattern.test(key)) return '[REDACTED]';
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (Array.isArray(value)) return value.map((item) => sanitize(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => [
        childKey,
        sanitize(childValue, childKey),
      ])
    );
  }
  return value;
}

function write(level: LogLevel, event: string, metadata: Record<string, unknown> = {}): void {
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...sanitize(metadata) as Record<string, unknown>,
  });
  if (level === 'error') console.error(payload);
  else if (level === 'warn') console.warn(payload);
  else console.log(payload);
}

export const logger = {
  info: (event: string, metadata?: Record<string, unknown>): void => write('info', event, metadata),
  warn: (event: string, metadata?: Record<string, unknown>): void => write('warn', event, metadata),
  error: (event: string, metadata?: Record<string, unknown>): void => write('error', event, metadata),
};
