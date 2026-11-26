import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Sparkles,
  ClipboardCheck,
  TicketPercent,
  Users,
  QrCode,
  LogOut,
  Menu,
  X,
  Server,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { POCKETBASE_URL } from '../../lib/pocketbase';

const NAV_ITEMS = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/bookings', label: 'Duyệt đơn & Thanh toán', icon: ClipboardCheck },
  { to: '/hotels', label: 'Quản lý Khách sạn', icon: Building2 },
  { to: '/rooms', label: 'Quản lý Phòng', icon: BedDouble },
  { to: '/amenities', label: 'Tiện ích chuẩn', icon: Sparkles },
  { to: '/coupons', label: 'Mã giảm giá', icon: TicketPercent },
  { to: '/customers', label: 'Khách hàng & Đánh giá', icon: Users },
  { to: '/payment-settings', label: 'Cấu hình VietQR', icon: QrCode },
];

export function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0F1E46] text-white">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <img
          src="/staybooking_logo.png"
          alt="StayBooking"
          className="h-10 w-10 rounded-xl shadow-md object-cover ring-1 ring-[#F4CB7C]/40"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-white">
              StayBooking
            </span>
            <span className="rounded-md bg-[#E8C170]/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F4CB7C]">
              Admin
            </span>
          </div>
          <p className="text-[11px] text-blue-200/75 truncate">
            Quản trị khách sạn & đặt phòng
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#2853AF] to-[#3B7CE8] text-white shadow-lg shadow-blue-950/40 ring-1 ring-white/15'
                    : 'text-blue-100/75 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4 space-y-3">
        <div className="rounded-xl bg-white/6 px-3 py-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
            <Server className="h-3.5 w-3.5" />
            <span>PocketBase Live API</span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-blue-200/70">
            {POCKETBASE_URL}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 px-1">
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">
              Quản trị viên
            </p>
            <p className="text-[11px] text-blue-200/75 truncate">
              {admin?.email}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất"
            className="rounded-xl p-2 text-blue-200/80 hover:bg-rose-500/20 hover:text-rose-200 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F6F8FA]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-68 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 z-20 rounded-lg p-1.5 text-white/80 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#ECEFF3] bg-white/90 px-4 sm:px-8 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-xl border border-[#ECEFF3] p-2 text-[#1A1B25] hover:bg-[#F6F8FA]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-semibold text-[#2853AF]">
                Hệ thống quản trị CT484 · StayBooking
              </p>
              <p className="text-[11px] text-[#666D80]">
                Đồng bộ dữ liệu thời gian thực với ứng dụng Flutter Mobile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Realtime SSE kết nối
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

