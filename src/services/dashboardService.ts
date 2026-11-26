import { pb } from '../lib/pocketbase';
import type { AdminStatsResponse } from '../types/models';

export const dashboardService = {
  async getStats(): Promise<AdminStatsResponse> {
    return pb.send<AdminStatsResponse>('/api/staybooking/admin/stats', {
      method: 'GET',
    });
  },
};

