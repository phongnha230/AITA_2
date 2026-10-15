/**
 * Deterministic date and time formatting utilities to prevent SSR/CSR hydration mismatches
 * and avoid direct locale formatting during render.
 */

export function formatDateTime(value?: string | number | Date | null): string {
  if (!value) return 'Chưa cập nhật';
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  if (!Number.isFinite(date.getTime())) return 'Chưa cập nhật';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${mins} • ${day}/${month}/${year}`;
}

export function formatDate(value?: string | number | Date | null): string {
  if (!value) return 'Chưa cập nhật';
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  if (!Number.isFinite(date.getTime())) return 'Chưa cập nhật';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function formatTime(value?: string | number | Date | null): string {
  if (!value) return '--:--';
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  if (!Number.isFinite(date.getTime())) return '--:--';

  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${mins}`;
}
