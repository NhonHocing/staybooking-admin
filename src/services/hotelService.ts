import { pb } from '../lib/pocketbase';
import type { HotelRecord } from '../types/models';

export type HotelPayload = Omit<
  HotelRecord,
  'id' | 'rating' | 'reviewCount' | 'created' | 'updated' | 'photos'
> & {
  newPhotos?: File[];
  removePhotos?: string[];
};

function buildHotelBody(
  payload: Partial<HotelPayload> & { rating?: number; reviewCount?: number },
  isCreate: boolean,
): FormData | Record<string, unknown> {
  const { newPhotos = [], removePhotos = [], ...fields } = payload;
  if (newPhotos.length === 0 && removePhotos.length === 0) {
    return fields;
  }

  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    formData.append(key, String(value));
  }
  for (const file of newPhotos) {
    formData.append(isCreate ? 'photos' : 'photos+', file);
  }
  if (!isCreate) {
    for (const filename of removePhotos) {
      formData.append('photos-', filename);
    }
  }
  return formData;
}

export const hotelService = {
  async list(): Promise<HotelRecord[]> {
    return pb.collection('hotels').getFullList<HotelRecord>({
      sort: 'name',
    });
  },

  async create(payload: HotelPayload): Promise<HotelRecord> {
    const body = buildHotelBody(
      {
        ...payload,
        rating: 0,
        reviewCount: 0,
      },
      true,
    );
    return pb.collection('hotels').create<HotelRecord>(body);
  },

  async update(id: string, payload: Partial<HotelPayload>): Promise<HotelRecord> {
    const body = buildHotelBody(payload, false);
    return pb.collection('hotels').update<HotelRecord>(id, body);
  },

  async toggleActive(id: string, active: boolean): Promise<HotelRecord> {
    return pb.collection('hotels').update<HotelRecord>(id, { active });
  },

  async remove(id: string): Promise<boolean> {
    return pb.collection('hotels').delete(id);
  },
};
