import { pb } from '../lib/pocketbase';
import type { CouponRecord } from '../types/models';

export type CouponPayload = Omit<CouponRecord, 'id'>;

export const couponService = {
  async list(): Promise<CouponRecord[]> {
    return pb.collection('coupons').getFullList<CouponRecord>({
      sort: 'code',
    });
  },

  async create(payload: CouponPayload): Promise<CouponRecord> {
    return pb.collection('coupons').create<CouponRecord>({
      ...payload,
      code: payload.code.trim().toUpperCase(),
    });
  },

  async update(
    id: string,
    payload: Partial<CouponPayload>,
  ): Promise<CouponRecord> {
    return pb.collection('coupons').update<CouponRecord>(id, {
      ...payload,
      ...(payload.code ? { code: payload.code.trim().toUpperCase() } : {}),
    });
  },

  async remove(id: string): Promise<boolean> {
    return pb.collection('coupons').delete(id);
  },
};

