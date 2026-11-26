import { pb } from '../lib/pocketbase';
import type { BookingRecord, PaymentStatus } from '../types/models';

export type BookingDecisionAction =
  | 'approve'
  | 'check_in'
  | 'complete'
  | 'cancel'
  | 'pending';

export const bookingService = {
  async list(): Promise<BookingRecord[]> {
    return pb.collection('bookings').getFullList<BookingRecord>({
      sort: '-created',
      expand: 'owner,room',
    });
  },

  async decide(
    id: string,
    action: BookingDecisionAction,
    adminNote = '',
  ): Promise<BookingRecord> {
    return pb.send<BookingRecord>(
      `/api/staybooking/admin/bookings/${id}/decision`,
      {
        method: 'POST',
        body: { action, adminNote },
      },
    );
  },

  async updatePayment(
    id: string,
    paymentStatus: PaymentStatus,
    adminNote = '',
  ): Promise<BookingRecord> {
    return pb.send<BookingRecord>(
      `/api/staybooking/admin/bookings/${id}/payment`,
      {
        method: 'POST',
        body: { paymentStatus, adminNote },
      },
    );
  },

  async remove(id: string): Promise<boolean> {
    return pb.collection('bookings').delete(id);
  },
};

