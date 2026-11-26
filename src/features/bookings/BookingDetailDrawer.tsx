import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  DoorOpen,
  Flag,
  XCircle,
  RotateCcw,
  Phone,
  CalendarDays,
  QrCode,
  Building2,
} from 'lucide-react';
import type { BookingRecord, PaymentStatus } from '../../types/models';
import type { BookingDecisionAction } from '../../services/bookingService';
import {
  calcNights,
  formatDateTimeVn,
  formatDateVn,
  formatVnd,
} from '../../lib/formatters';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from '../../components/ui/StatusBadge';

interface BookingDetailDrawerProps {
  booking: BookingRecord | null;
  busy: boolean;
  onClose: () => void;
  onDecide: (
    booking: BookingRecord,
    action: BookingDecisionAction,
    adminNote: string,
  ) => Promise<void>;
  onUpdatePayment: (
    booking: BookingRecord,
    paymentStatus: PaymentStatus,
    adminNote: string,
  ) => Promise<void>;
}

export function BookingDetailDrawer({
  booking,
  busy,
  onClose,
  onDecide,
  onUpdatePayment,
}: BookingDetailDrawerProps) {
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    setAdminNote(booking?.adminNote || '');
  }, [booking]);

  if (!booking) return null;

  const nights = calcNights(booking.checkIn, booking.checkOut);
  const payable = booking.finalTotal > 0 ? booking.finalTotal : booking.total;
  const code =
    booking.bookingCode || `#SB-${booking.id.slice(0, 6).toUpperCase()}`;

  return (
    <ModalDrawer
      open={Boolean(booking)}
      onClose={onClose}
      title={`Đơn đặt phòng ${code}`}
      subtitle={`Tạo lúc ${formatDateTimeVn(booking.created)} · ID: ${booking.id}`}
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Status summary bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F6F8FA] border border-[#ECEFF3] p-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#666D80]">
              Trạng thái đơn & Thanh toán
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <BookingStatusBadge status={booking.status} />
              <PaymentStatusBadge
                status={booking.paymentStatus}
                method={booking.paymentMethod}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#666D80]">
              Tổng khách thanh toán
            </p>
            <p className="mt-1 text-xl font-extrabold text-[#2853AF]">
              {formatVnd(payable)}
            </p>
          </div>
        </div>

        {/* Hotel & Customer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#ECEFF3] p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2853AF] flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Thông tin lưu trú
            </p>
            <p className="font-bold text-[#1A1B25]">{booking.hotelName}</p>
            <p className="text-sm text-[#666D80]">{booking.roomName}</p>
            <div className="pt-1 flex items-center gap-1.5 text-xs text-[#1A1B25] font-medium">
              <CalendarDays className="h-3.5 w-3.5 text-[#2853AF]" />
              <span>
                {formatDateVn(booking.checkIn)} → {formatDateVn(booking.checkOut)}{' '}
                ({nights} đêm · {booking.guests} khách)
              </span>
            </div>
            {booking.addOns && (
              <p className="text-xs text-[#666D80]">
                Dịch vụ thêm:{' '}
                <span className="font-semibold text-[#1A1B25]">
                  {booking.addOns}
                </span>
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[#ECEFF3] p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2853AF] flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Thông tin khách hàng
            </p>
            <p className="font-bold text-[#1A1B25]">{booking.contactName}</p>
            <p className="text-sm font-mono font-semibold text-[#2853AF]">
              {booking.phone}
            </p>
            <p className="text-xs text-[#666D80]">
              Ghi chú khách:{' '}
              <span className="text-[#1A1B25]">
                {booking.note || 'Không có ghi chú'}
              </span>
            </p>
            {booking.approvedAt && (
              <p className="text-[11px] text-emerald-700 font-medium">
                Đã duyệt lúc: {formatDateTimeVn(booking.approvedAt)}
              </p>
            )}
            {booking.paidAt && (
              <p className="text-[11px] text-emerald-700 font-medium">
                Xác nhận TT lúc: {formatDateTimeVn(booking.paidAt)}
              </p>
            )}
          </div>
        </div>

        {/* Financial breakdown */}
        <div className="rounded-2xl border border-[#ECEFF3] p-4 space-y-2 text-sm">
          <div className="flex items-center justify-between text-[#666D80]">
            <span>
              Giá phòng ({formatVnd(booking.nightlyPrice)} × {nights} đêm)
            </span>
            <span className="font-semibold text-[#1A1B25]">
              {formatVnd(booking.nightlyPrice * nights)}
            </span>
          </div>
          {booking.addOnsFee > 0 && (
            <div className="flex items-center justify-between text-[#666D80]">
              <span>Phụ thu dịch vụ thêm</span>
              <span className="font-semibold text-[#1A1B25]">
                +{formatVnd(booking.addOnsFee)}
              </span>
            </div>
          )}
          {booking.discount > 0 && (
            <div className="flex items-center justify-between text-emerald-700">
              <span>
                Mã giảm giá {booking.couponCode ? `(${booking.couponCode})` : ''}
              </span>
              <span className="font-bold">-{formatVnd(booking.discount)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-[#ECEFF3] flex items-center justify-between">
            <span className="font-bold text-[#1A1B25] flex items-center gap-1.5">
              <QrCode className="h-4 w-4 text-[#2853AF]" />
              {booking.paymentMethod === 'vietqr'
                ? 'Chuyển khoản VietQR'
                : 'Thanh toán tại khách sạn'}
            </span>
            <span className="text-base font-extrabold text-[#2853AF]">
              {formatVnd(payable)}
            </span>
          </div>
        </div>

        {/* Admin Note */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#666D80] mb-1.5">
            Ghi chú quản trị / Phản hồi cho khách (hiển thị trên app Mobile)
          </label>
          <textarea
            rows={2}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="VD: Đã nhận đủ chuyển khoản VietQR, phòng sẵn sàng đón khách lúc 14:00..."
            className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm focus:border-[#2853AF] focus:outline-none"
          />
        </div>

        {/* Payment Verification Actions */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <CreditCard className="h-4 w-4" />
            <h3 className="text-sm font-bold">
              Đối soát & Xác nhận thanh toán cho User
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || booking.paymentStatus === 'paid'}
              onClick={() => onUpdatePayment(booking, 'paid', adminNote)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-45 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Xác nhận ĐÃ thanh toán</span>
            </button>

            <button
              type="button"
              disabled={busy || booking.paymentStatus === 'unpaid'}
              onClick={() => onUpdatePayment(booking, 'unpaid', adminNote)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFE1E6] bg-white px-3.5 py-2 text-xs font-bold text-[#1A1B25] hover:bg-[#F6F8FA] disabled:opacity-45 cursor-pointer"
            >
              <span>Đặt lại Chưa TT</span>
            </button>

            <button
              type="button"
              disabled={busy || booking.paymentStatus === 'refunded'}
              onClick={() => onUpdatePayment(booking, 'refunded', adminNote)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-45 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Đánh dấu Đã hoàn tiền</span>
            </button>
          </div>
        </div>

        {/* Booking Approval / Lifecycle Actions */}
        <div className="rounded-2xl border border-[#DCE8FD] bg-[#F4F8FF] p-4 space-y-3">
          <h3 className="text-sm font-bold text-[#173274]">
            Duyệt đơn & Trạng thái lưu trú
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || booking.status === 'confirmed'}
              onClick={() => onDecide(booking, 'approve', adminNote)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2853AF] px-4 py-2 text-xs font-bold text-white hover:bg-[#1E429F] disabled:opacity-45 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Duyệt xác nhận đơn</span>
            </button>

            <button
              type="button"
              disabled={busy || booking.status === 'checked_in' || booking.status === 'cancelled'}
              onClick={() => onDecide(booking, 'check_in', adminNote)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-sky-700 disabled:opacity-45 cursor-pointer"
            >
              <DoorOpen className="h-4 w-4" />
              <span>Đã nhận phòng (Check-in)</span>
            </button>

            <button
              type="button"
              disabled={busy || booking.status === 'completed' || booking.status === 'cancelled'}
              onClick={() => onDecide(booking, 'complete', adminNote)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-45 cursor-pointer"
            >
              <Flag className="h-4 w-4" />
              <span>Hoàn tất lưu trú</span>
            </button>

            <button
              type="button"
              disabled={busy || booking.status === 'cancelled'}
              onClick={() => onDecide(booking, 'cancel', adminNote)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-45 cursor-pointer"
            >
              <XCircle className="h-4 w-4" />
              <span>Từ chối / Hủy đơn</span>
            </button>
          </div>
        </div>
      </div>
    </ModalDrawer>
  );
}

