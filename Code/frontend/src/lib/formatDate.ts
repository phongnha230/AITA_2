/** Format date and time consistently on servers and clients in the project's timezone. */

const DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'Asia/Ho_Chi_Minh',
});

const TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Ho_Chi_Minh',
});

export function formatDateTime(value?: string | number | Date | null): string {
  if (!value) return 'Chưa cập nhật';
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  if (!Number.isFinite(date.getTime())) return 'Chưa cập nhật';

  return `${TIME_FORMATTER.format(date)} • ${DATE_FORMATTER.format(date)}`;
}

export function formatDate(value?: string | number | Date | null): string {
  if (!value) return 'Chưa cập nhật';
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  if (!Number.isFinite(date.getTime())) return 'Chưa cập nhật';

  return DATE_FORMATTER.format(date);
}

export function formatTime(value?: string | number | Date | null): string {
  if (!value) return '--:--';
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  if (!Number.isFinite(date.getTime())) return '--:--';

  return TIME_FORMATTER.format(date);
}
