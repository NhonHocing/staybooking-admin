export function formatVnd(amount: number | undefined | null): string {
  const value = Math.round(Number(amount || 0));
  return `${value.toLocaleString('vi-VN')} ₫`;
}

export function formatDateVn(isoDate: string | undefined | null): string {
  if (!isoDate) return '—';
  const clean = isoDate.slice(0, 10);
  const parts = clean.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function formatDateTimeVn(value: string | undefined | null): string {
  if (!value) return '—';
  const normalized = value.replace('T', ' ').slice(0, 16);
  const [datePart, timePart] = normalized.split(' ');
  if (!datePart) return value;
  const formattedDate = formatDateVn(datePart);
  return timePart ? `${timePart} · ${formattedDate}` : formattedDate;
}

export function calcNights(checkIn: string, checkOut: string): number {
  const start = Date.parse(checkIn);
  const end = Date.parse(checkOut);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 1;
  return Math.max(1, Math.round((end - start) / 86400000));
}

export function parseCsvList(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function toCsvList(items: string[]): string {
  return Array.from(new Set(items.map((s) => s.trim()).filter(Boolean))).join(', ');
}

