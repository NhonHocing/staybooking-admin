import PocketBase, { ClientResponseError } from 'pocketbase';

export const POCKETBASE_URL =
  import.meta.env.VITE_POCKETBASE_URL?.trim() || 'http://127.0.0.1:8090';

export const pb = new PocketBase(POCKETBASE_URL);
pb.autoCancellation(false);

export function getRecordPhotoUrl(
  collection: 'hotels' | 'rooms',
  recordId: string,
  filename: string,
  thumb?: string,
): string {
  const cleanFile = encodeURIComponent(filename);
  const base = `${POCKETBASE_URL}/api/files/${collection}/${recordId}/${cleanFile}`;
  return thumb ? `${base}?thumb=${encodeURIComponent(thumb)}` : base;
}

export function getRecordCoverPhotoUrl(
  collection: 'hotels' | 'rooms',
  record: { id: string; photos?: string[]; images?: string },
  thumb = '240x180',
): string | null {
  if (Array.isArray(record.photos) && record.photos.length > 0 && record.photos[0]) {
    return getRecordPhotoUrl(collection, record.id, record.photos[0], thumb);
  }
  const external = (record.images || '')
    .split(',')
    .map((u) => u.trim())
    .find((u) => /^https?:\/\//i.test(u));
  return external || null;
}

export function countRecordPhotos(record: { photos?: string[]; images?: string }): number {
  const uploaded = Array.isArray(record.photos)
    ? record.photos.filter(Boolean).length
    : 0;
  const external = (record.images || '')
    .split(',')
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//i.test(u)).length;
  return uploaded + external;
}

export function extractErrorMessage(err: unknown): string {
  if (err instanceof ClientResponseError) {
    if (err.status === 0) {
      return `Không kết nối được máy chủ PocketBase (${POCKETBASE_URL}). Hãy đảm bảo backend đang chạy.`;
    }
    const dataErrors = err.response?.data;
    if (dataErrors && typeof dataErrors === 'object') {
      const firstKey = Object.keys(dataErrors)[0];
      if (firstKey && dataErrors[firstKey]?.message) {
        return `${firstKey}: ${dataErrors[firstKey].message}`;
      }
    }
    if (err.response?.message) {
      return String(err.response.message);
    }
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Có lỗi không xác định xảy ra. Vui lòng thử lại.';
}

