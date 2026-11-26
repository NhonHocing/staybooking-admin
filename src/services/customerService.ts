import { pb } from '../lib/pocketbase';
import type { ReviewRecord, UserRecord } from '../types/models';

export const customerService = {
  async listUsers(): Promise<UserRecord[]> {
    return pb.collection('users').getFullList<UserRecord>({
      sort: '-created',
    });
  },

  async listReviews(): Promise<ReviewRecord[]> {
    return pb.collection('reviews').getFullList<ReviewRecord>({
      sort: '-created',
      expand: 'hotel',
    });
  },

  async deleteReview(id: string): Promise<boolean> {
    return pb.collection('reviews').delete(id);
  },
};

