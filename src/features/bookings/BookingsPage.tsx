import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  RefreshCw,
  CheckCircle2,
  CreditCard,
  Eye,
  QrCode,
  Building2,
} from 'lucide-react';
import {
  bookingService,
  type BookingDecisionAction,
} from '../../services/bookingService';
import type { BookingRecord, PaymentStatus } from '../../types/models';
import { extractErrorMessage, pb } from '../../lib/pocketbase';
import { formatDateVn, formatVnd } from '../../lib/formatters';
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/ToastProvider';
import { BookingDetailDrawer } from './BookingDetailDrawer';

type FilterTab =
  | 'all'
  | 'needs_payment'
  | 'paid'
  | 'confirmed'
  | 'cancelled';

export function BookingsPage() {
  const { notify } = useToast();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<BookingRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await bookingService.list();
      setBookings(list);
      setSelected((prev) =>
        prev ? list.find((item) => item.id === prev.id) ?? null : null,
      );
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void load();
    let timer: number | undefined;
    void pb
      .collection('bookings')
      .subscribe('*', (event) => {
        if (event.action === 'create') {
          notify('Có đơn đặt phòng mới vừa gửi từ ứng dụng!', 'info');
        }
        window.clearTimeout(timer);
        timer = window.setTimeout(() => void load(), 200);
      })
      .catch(() => {});
    return () => {
      window.clearTimeout(timer);
      void pb.collection('bookings').unsubscribe('*').catch(() => {});
    };
  }, [load, notify]);

  const counts = useMemo(() => {
    let needsPayment = 0;
    let paid = 0;
    let confirmed = 0;
    let cancelled = 0;
    bookings.forEach((b) => {
      const ps =
        b.paymentStatus ||
        (b.paymentMethod === 'vietqr' ? 'pending_verification' : 'unpaid');
      if (b.status === 'cancelled') cancelled++;
      else {
        if (b.status === 'confirmed' || b.status === 'checked_in' || b.status === 'completed') {
          confirmed++;
        }
        if (ps === 'paid') paid++;
        else needsPayment++;
      }
    });
    return {
      all: bookings.length,
      needsPayment,
      paid,
      confirmed,
      cancelled,
    };
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      const ps =
        b.paymentStatus ||
        (b.paymentMethod === 'vietqr' ? 'pending_verification' : 'unpaid');
      if (tab === 'needs_payment' && (b.status === 'cancelled' || ps === 'paid')) {
        return false;
      }
      if (tab === 'paid' && ps !== 'paid') return false;
      if (
        tab === 'confirmed' &&
        b.status !== 'confirmed' &&
        b.status !== 'checked_in' &&
        b.status !== 'completed'
      ) {
        return false;
      }
      if (tab === 'cancelled' && b.status !== 'cancelled') return false;

      if (!q) return true;
      return (
        (b.bookingCode || '').toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.contactName.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        b.hotelName.toLowerCase().includes(q) ||
        b.roomName.toLowerCase().includes(q)
      );
    });
  }, [bookings, tab, search]);

  const handleDecide = async (
    booking: BookingRecord,
    action: BookingDecisionAction,
    adminNote = '',
  ) => {
    setBusyId(booking.id);
    try {
      await bookingService.decide(booking.id, action, adminNote);
      const actionLabels: Record<BookingDecisionAction, string> = {
        approve: 'đã duyệt xác nhận',
        check_in: 'đã nhận phòng',
        complete: 'đã hoàn tất',
        cancel: 'đã hủy',
        pending: 'chuyển về chờ duyệt',
      };
      notify(
        `Đơn ${booking.bookingCode || booking.id.slice(0, 6)} ${actionLabels[action]}.`,
      );
      await load();
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handlePayment = async (
    booking: BookingRecord,
    paymentStatus: PaymentStatus,
    adminNote = '',
  ) => {
    setBusyId(booking.id);
    try {
      await bookingService.updatePayment(booking.id, paymentStatus, adminNote);
      const label =
        paymentStatus === 'paid'
          ? 'Đã xác nhận thanh toán'
          : paymentStatus === 'refunded'
            ? 'Đã đánh dấu hoàn tiền'
            : 'Đã đặt lại chưa thanh toán';
      notify(`${label} cho đơn ${booking.bookingCode || booking.id.slice(0, 6)}.`);
      await load();
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1B25]">
            Duyệt đơn & Xác nhận Thanh toán
          </h1>
          <p className="mt-1 text-sm text-[#666D80]">
            Kiểm tra đơn đặt phòng từ người dùng, đối soát chuyển khoản VietQR / tiền mặt và duyệt trực tiếp.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DFE1E6] bg-white px-4 py-2.5 text-sm font-semibold text-[#1A1B25] hover:bg-[#F6F8FA] cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Tải lại</span>
        </button>
      </div>

      {/* Filter Tabs + Search */}
      <div className="rounded-2xl border border-[#ECEFF3] bg-white p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', `Tất cả (${counts.all})`],
              ['needs_payment', `Chờ xác nhận TT (${counts.needsPayment})`],
              ['paid', `Đã thanh toán (${counts.paid})`],
              ['confirmed', `Đang hoạt động (${counts.confirmed})`],
              ['cancelled', `Đã hủy (${counts.cancelled})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                tab === key
                  ? 'bg-[#2853AF] text-white shadow-sm'
                  : 'bg-[#F6F8FA] text-[#666D80] hover:bg-[#E8F2FF] hover:text-[#2853AF]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="h-4 w-4 text-[#666D80] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn (SB-...), tên khách, số điện thoại, tên khách sạn..."
            className="w-full rounded-xl border border-[#DFE1E6] bg-[#F6F8FA] pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:border-[#2853AF] focus:outline-none"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl border border-[#ECEFF3] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F6F8FA] text-xs uppercase text-[#666D80]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Mã đơn & Ngày</th>
                <th className="px-5 py-3.5 font-semibold">Khách hàng</th>
                <th className="px-5 py-3.5 font-semibold">Khách sạn / Phòng</th>
                <th className="px-5 py-3.5 font-semibold">Thanh toán</th>
                <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-3.5 font-semibold text-right">
                  Duyệt & Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEFF3]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#666D80]">
                    Đang tải danh sách đơn đặt phòng…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#666D80]">
                    Không có đơn đặt phòng phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const payable = b.finalTotal > 0 ? b.finalTotal : b.total;
                  const isPaid = b.paymentStatus === 'paid';
                  const isBusy = busyId === b.id;
                  return (
                    <tr key={b.id} className="hover:bg-[#F9FBFF]">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-mono text-xs font-extrabold text-[#2853AF]">
                          {b.bookingCode || `#${b.id.slice(0, 6).toUpperCase()}`}
                        </p>
                        <p className="mt-1 text-xs text-[#666D80]">
                          {formatDateVn(b.checkIn)} → {formatDateVn(b.checkOut)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-[#1A1B25]">
                          {b.contactName}
                        </p>
                        <p className="text-xs font-mono text-[#666D80]">
                          {b.phone}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#1A1B25]">
                          {b.hotelName}
                        </p>
                        <p className="text-xs text-[#666D80]">
                          {b.roomName} · {b.guests} khách
                        </p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-extrabold text-[#1A1B25]">
                          {formatVnd(payable)}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#666D80]">
                            {b.paymentMethod === 'vietqr' ? (
                              <>
                                <QrCode className="h-3 w-3 text-[#2853AF]" /> VietQR
                              </>
                            ) : (
                              <>
                                <Building2 className="h-3 w-3" /> Tại KS
                              </>
                            )}
                          </span>
                          <PaymentStatusBadge
                            status={b.paymentStatus}
                            method={b.paymentMethod}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {b.status === 'pending' && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDecide(b, 'approve')}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#2853AF] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#1E429F] disabled:opacity-50 cursor-pointer"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Duyệt
                            </button>
                          )}
                          {b.status !== 'cancelled' && !isPaid && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handlePayment(b, 'paid')}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              Xác nhận TT
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelected(b)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#DFE1E6] bg-white px-2.5 py-1.5 text-xs font-bold text-[#1A1B25] hover:bg-[#F6F8FA] cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BookingDetailDrawer
        booking={selected}
        busy={busyId !== null}
        onClose={() => setSelected(null)}
        onDecide={handleDecide}
        onUpdatePayment={handlePayment}
      />
    </div>
  );
}

