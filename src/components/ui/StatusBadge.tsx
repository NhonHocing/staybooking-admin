import type { BookingStatus, PaymentStatus } from '../../types/models';

export function BookingStatusBadge({ status }: { status: BookingStatus | string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: {
      label: 'Chờ duyệt',
      cls: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    confirmed: {
      label: 'Đã duyệt',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    checked_in: {
      label: 'Đã nhận phòng',
      cls: 'bg-blue-50 text-[#2853AF] border-blue-200',
    },
    completed: {
      label: 'Hoàn tất',
      cls: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    cancelled: {
      label: 'Đã hủy',
      cls: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  };

  const info = map[status] ?? {
    label: status || 'Không rõ',
    cls: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${info.cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {info.label}
    </span>
  );
}

export function PaymentStatusBadge({
  status,
  method,
}: {
  status: PaymentStatus | string;
  method?: string;
}) {
  const effective =
    status || (method === 'vietqr' ? 'pending_verification' : 'unpaid');

  const map: Record<string, { label: string; cls: string }> = {
    paid: {
      label: 'Đã thanh toán',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    pending_verification: {
      label: 'Chờ duyệt VietQR',
      cls: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    unpaid: {
      label: 'Chưa thanh toán',
      cls: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    refunded: {
      label: 'Đã hoàn tiền',
      cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  };

  const info = map[effective] ?? map.unpaid;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${info.cls}`}
    >
      {info.label}
    </span>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        active
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-slate-100 text-slate-500 border-slate-200'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`}
      />
      {active ? 'Đang mở' : 'Đang ẩn'}
    </span>
  );
}

