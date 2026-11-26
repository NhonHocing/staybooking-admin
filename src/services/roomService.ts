import { pb } from '../lib/pocketbase';
import type { RoomRecord } from '../types/models';

export type RoomPayload = Omit<RoomRecord, 'id' | 'expand' | 'photos'> & {
  newPhotos?: File[];
  removePhotos?: string[];
};

function buildRoomBody(
  payload: Partial<RoomPayload>,
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

export const roomService = {
  async list(hotelId?: string): Promise<RoomRecord[]> {
    return pb.collection('rooms').getFullList<RoomRecord>({
      sort: 'price',
      expand: 'hotel',
      filter: hotelId ? `hotel = "${hotelId}"` : undefined,
    });
  },

  async create(payload: RoomPayload): Promise<RoomRecord> {
    const body = buildRoomBody(payload, true);
    return pb.collection('rooms').create<RoomRecord>(body, {
      expand: 'hotel',
    });
  },

  async update(id: string, payload: Partial<RoomPayload>): Promise<RoomRecord> {
    const body = buildRoomBody(payload, false);
    return pb.collection('rooms').update<RoomRecord>(id, body, {
      expand: 'hotel',
    });
  },

  async toggleActive(id: string, active: boolean): Promise<RoomRecord> {
    return pb.collection('rooms').update<RoomRecord>(
      id,
      { active },
      { expand: 'hotel' },
    );
  },

  async remove(id: string): Promise<boolean> {
    return pb.collection('rooms').delete(id);
  },
};
