import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  BedDouble,
  ClipboardCheck,
  Wallet,
  RefreshCw,
  ArrowRight,
  Clock3,
  Users,
  Sparkles,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import type { AdminStatsResponse } from '../../types/models';
import { extractErrorMessage, pb } from '../../lib/pocketbase';
import { formatDateVn, formatVnd } from '../../lib/formatters';
import { StatCard } from '../../components/ui/StatCard';
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from '../../components/ui/StatusBadge';

export function DashboardPage() {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    let timer: number | undefined;
    const scheduleReload = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void load(), 250);
    };
    const collections = ['bookings', 'hotels', 'rooms', 'reviews', 'users'];
    collections.forEach((col) => {
      void pb.collection(col).subscribe('*', scheduleReload).catch(() => {});
    });
    return () => {
      window.clearTimeout(timer);
      collections.forEach((col) => {
        void pb.collection(col).unsubscribe('*').catch(() => {});
      });
    };
  }, [load]);

  if (loading && !stats) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-[#666D80]">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#2853AF] border-t-transparent" />
        <p className="text-sm font-medium">Đang tải thống kê thời gian thực…</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <p className="text-sm font-semibold text-rose-700">{error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const maxHotelRev = Math.max(
    1,
    ...stats.revenueByHotel.map((h) => h.revenue),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1B25]">
            Tổng quan vận hành
          </h1>
          <p className="mt-1 text-sm text-[#666D80]">
            Dữ liệu trực tiếp từ PocketBase — kiểm soát khách sạn, phòng, duyệt đơn và dòng tiền.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DFE1E6] bg-white px-4 py-2.5 text-sm font-semibold text-[#1A1B25] hover:bg-[#F6F8FA] transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Doanh thu đã xác nhận TT"
          value={formatVnd(stats.finance.paidRevenue)}
          hint={`Dự kiến toàn bộ: ${formatVnd(stats.finance.expectedRevenue)}`}
          icon={Wallet}
          accent="emerald"
        />
        <StatCard
          label="Đơn chờ duyệt / TT"
          value={`${stats.finance.pendingPaymentCount} đơn`}
          hint={`Chờ duyệt đơn: ${stats.bookingsByStatus.pending} · Tổng ${stats.totals.bookings} đơn`}
          icon={Clock3}
          accent="amber"
        />
        <StatCard
          label="Khách sạn & Phòng"
          value={`${stats.totals.hotels} KS · ${stats.totals.rooms} phòng`}
          hint={`Đang mở: ${stats.totals.activeHotels} KS · ${stats.totals.activeRooms} phòng`}
          icon={Building2}
          accent="royal"
        />
        <StatCard
          label="Khách hàng & Tiện ích"
          value={`${stats.totals.users} user`}
          hint={`${stats.totals.amenities} tiện ích · ${stats.totals.reviews} nhận xét phòng`}
          icon={Users}
          accent="rose"
        />
      </div>

      {/* Quick Action Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          {
            to: '/bookings',
            title: 'Duyệt đơn & Thanh toán',
            desc: 'Xác nhận chuyển khoản VietQR & duyệt đặt phòng',
            icon: ClipboardCheck,
          },
          {
            to: '/hotels',
            title: 'Thêm / Sửa Khách sạn',
            desc: 'Cập nhật địa chỉ, 34 tỉnh thành & tọa độ GPS',
            icon: Building2,
          },
          {
            to: '/rooms',
            title: 'Thêm / Sửa Phòng nghỉ',
            desc: 'Thiết lập giá/đêm, sức chứa, diện tích & tiện ích',
            icon: BedDouble,
          },
          {
            to: '/amenities',
            title: 'Danh mục Tiện ích',
            desc: 'Chuẩn hóa tiện ích cho khách sạn và phòng',
            icon: Sparkles,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.to}
              to={card.to}
              className="group rounded-2xl border border-[#ECEFF3] bg-white p-4 hover:border-[#2853AF]/40 hover:shadow-md transition-all flex items-start gap-3"
            >
              <div className="h-10 w-10 rounded-xl bg-[#E8F2FF] text-[#2853AF] flex items-center justify-center shrink-0 group-hover:bg-[#2853AF] group-hover:text-white transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1A1B25] flex items-center justify-between gap-1">
                  <span className="truncate">{card.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#666D80] group-hover:translate-x-0.5 group-hover:text-[#2853AF] transition-all shrink-0" />
                </p>
                <p className="mt-1 text-xs text-[#666D80] line-clamp-2">
                  {card.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main split: Revenue by hotel + Status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl border border-[#ECEFF3] bg-white p-6">
          <div className="flex items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-base font-bold text-[#1A1B25]">
                Doanh thu đã thanh toán theo khách sạn
              </h2>
              <p className="text-xs text-[#666D80]">
                Chỉ tính các đơn đã được quản trị xác nhận thanh toán
              </p>
            </div>
          </div>

          {stats.revenueByHotel.length === 0 ? (
            <div className="rounded-xl bg-[#F6F8FA] p-8 text-center text-sm text-[#666D80]">
              Chưa có đơn đặt phòng nào được xác nhận đã thanh toán. Hãy vào mục{' '}
              <Link
                to="/bookings"
                className="font-bold text-[#2853AF] underline"
              >
                Duyệt đơn & Thanh toán
              </Link>{' '}
              để đối soát đơn hàng đầu tiên.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.revenueByHotel.map((item) => {
                const pct = Math.max(
                  6,
                  Math.round((item.revenue / maxHotelRev) * 100),
                );
                return (
                  <div key={item.hotelName}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-semibold text-[#1A1B25]">
                        {item.hotelName}
                      </span>
                      <span className="font-bold text-[#2853AF]">
                        {formatVnd(item.revenue)}
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-[#EEF3FB] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2853AF] to-[#4593EC]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-[#ECEFF3] bg-white p-6">
          <h2 className="text-base font-bold text-[#1A1B25] mb-1">
            Tỷ lệ trạng thái đơn đặt phòng
          </h2>
          <p className="text-xs text-[#666D80] mb-5">
            Tổng hợp toàn bộ vòng đời đơn trong hệ thống
          </p>
          <div className="space-y-3">
            {[
              { label: 'Chờ duyệt', count: stats.bookingsByStatus.pending, color: 'bg-amber-400' },
              { label: 'Đã xác nhận', count: stats.bookingsByStatus.confirmed, color: 'bg-emerald-500' },
              { label: 'Đã nhận phòng (Check-in)', count: stats.bookingsByStatus.checked_in, color: 'bg-[#2853AF]' },
              { label: 'Đã hoàn tất', count: stats.bookingsByStatus.completed, color: 'bg-slate-500' },
              { label: 'Đã hủy', count: stats.bookingsByStatus.cancelled, color: 'bg-rose-500' },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-xl bg-[#F6F8FA] px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${row.color}`} />
                  <span className="text-sm font-medium text-[#1A1B25]">
                    {row.label}
                  </span>
                </div>
                <span className="text-sm font-extrabold text-[#1A1B25]">
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="rounded-2xl border border-[#ECEFF3] bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECEFF3]">
          <div>
            <h2 className="text-base font-bold text-[#1A1B25]">
              Đơn đặt phòng mới nhất
            </h2>
            <p className="text-xs text-[#666D80]">
              8 giao dịch gần nhất từ khách hàng trên ứng dụng
            </p>
          </div>
          <Link
            to="/bookings"
            className="text-xs font-bold text-[#2853AF] hover:underline flex items-center gap-1"
          >
            Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F6F8FA] text-xs uppercase text-[#666D80]">
              <tr>
                <th className="px-5 py-3 font-semibold">Mã đơn</th>
                <th className="px-5 py-3 font-semibold">Khách hàng</th>
                <th className="px-5 py-3 font-semibold">Khách sạn / Phòng</th>
                <th className="px-5 py-3 font-semibold">Ngày ở</th>
                <th className="px-5 py-3 font-semibold">Tổng tiền</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold">Thanh toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEFF3]">
              {stats.recentBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-[#666D80]"
                  >
                    Chưa có đơn đặt phòng nào trong hệ thống.
                  </td>
                </tr>
              ) : (
                stats.recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F9FBFF]">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#2853AF]">
                      {b.bookingCode || `#${b.id.slice(0, 6).toUpperCase()}`}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#1A1B25]">
                        {b.contactName}
                      </p>
                      <p className="text-xs text-[#666D80]">{b.phone}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#1A1B25]">
                        {b.hotelName}
                      </p>
                      <p className="text-xs text-[#666D80]">{b.roomName}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#666D80] whitespace-nowrap">
                      {formatDateVn(b.checkIn)} → {formatDateVn(b.checkOut)}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#1A1B25] whitespace-nowrap">
                      {formatVnd(b.finalTotal > 0 ? b.finalTotal : b.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <BookingStatusBadge status={b.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <PaymentStatusBadge
                        status={b.paymentStatus}
                        method={b.paymentMethod}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

