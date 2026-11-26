import { pb } from '../lib/pocketbase';
import type { AmenityCategory, AmenityRecord } from '../types/models';

export interface AmenityPayload {
  name: string;
  category: AmenityCategory;
  icon: string;
  description: string;
  active: boolean;
}

export const amenityService = {
  async list(): Promise<AmenityRecord[]> {
    return pb.collection('amenities').getFullList<AmenityRecord>({
      sort: 'name',
    });
  },

  async create(payload: AmenityPayload): Promise<AmenityRecord> {
    return pb.collection('amenities').create<AmenityRecord>(payload);
  },

  async update(
    id: string,
    payload: Partial<AmenityPayload>,
  ): Promise<AmenityRecord> {
    return pb.collection('amenities').update<AmenityRecord>(id, payload);
  },

  async toggleActive(id: string, active: boolean): Promise<AmenityRecord> {
    return pb.collection('amenities').update<AmenityRecord>(id, { active });
  },

  async remove(id: string): Promise<boolean> {
    return pb.collection('amenities').delete(id);
  },
};

