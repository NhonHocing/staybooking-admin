import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage, POCKETBASE_URL } from '../../lib/pocketbase';

export function LoginPage() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@staybooking.vn');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (admin) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu quản trị.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const fillDefaultAdmin = () => {
    setEmail('admin@staybooking.vn');
    setPassword('AdminStayBooking2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#F6F8FA]">
      {/* Left luxury brand column */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between bg-gradient-to-br from-[#0E1E49] via-[#1B3A86] to-[#2853AF] p-10 text-white relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#4593EC]/25 blur-3xl" />
        <div className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-[#E8C170]/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3.5">
          <img
            src="/staybooking_logo.png"
            alt="StayBooking"
            className="h-12 w-12 rounded-2xl shadow-lg ring-1 ring-[#F4CB7C]/50"
          />
          <div>
            <p className="text-xl font-extrabold tracking-tight">StayBooking</p>
            <p className="text-xs font-medium text-blue-200">
              Hệ thống Quản trị Khách sạn & Đặt phòng
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-[#F4CB7C]">
            <ShieldCheck className="h-4 w-4" />
            <span>Kết nối trực tiếp PocketBase API</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Điều hành toàn bộ khách sạn, phòng nghỉ & duyệt thanh toán tại một nơi.
          </h1>
          <p className="text-sm text-blue-100/80 leading-relaxed max-w-md">
            Mọi thay đổi về khách sạn, hạng phòng, tiện ích, duyệt đơn đặt phòng và
            xác nhận thanh toán VietQR đều đồng bộ tức thì sang ứng dụng di động StayBooking.
          </p>
        </div>

        <div className="relative z-10 rounded-2xl bg-white/8 border border-white/15 p-4 text-xs text-blue-100/85">
          <p className="font-semibold text-white">Máy chủ API đang kết nối</p>
          <p className="mt-1 font-mono text-[11px] text-blue-200">{POCKETBASE_URL}</p>
        </div>
      </div>

      {/* Right login form */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img
              src="/staybooking_logo.png"
              alt="StayBooking"
              className="h-11 w-11 rounded-2xl shadow-md"
            />
            <div>
              <p className="text-lg font-extrabold text-[#1A1B25]">
                StayBooking Admin
              </p>
              <p className="text-xs text-[#666D80]">
                Quản trị khách sạn & duyệt thanh toán
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-[#ECEFF3] p-8 shadow-[0_12px_40px_rgba(23,50,116,0.07)]">
            <h2 className="text-2xl font-extrabold text-[#1A1B25]">
              Đăng nhập Quản trị viên
            </h2>
            <p className="mt-1.5 text-sm text-[#666D80]">
              Sử dụng tài khoản Superuser PocketBase để truy cập bảng điều khiển.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#666D80] mb-1.5">
                  Email quản trị
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-[#666D80] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@staybooking.vn"
                    className="w-full rounded-xl border border-[#DFE1E6] bg-[#F6F8FA] pl-10 pr-4 py-3 text-sm font-medium text-[#1A1B25] focus:bg-white focus:border-[#2853AF] focus:outline-none focus:ring-3 focus:ring-[#2853AF]/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#666D80] mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-[#666D80] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu quản trị"
                    className="w-full rounded-xl border border-[#DFE1E6] bg-[#F6F8FA] pl-10 pr-4 py-3 text-sm font-medium text-[#1A1B25] focus:bg-white focus:border-[#2853AF] focus:outline-none focus:ring-3 focus:ring-[#2853AF]/15"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2853AF] via-[#3076E0] to-[#4593EC] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#2853AF]/25 hover:brightness-105 disabled:opacity-60 transition-all cursor-pointer"
              >
                <span>{busy ? 'Đang đăng nhập…' : 'Vào trang quản trị'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#ECEFF3]">
              <button
                type="button"
                onClick={fillDefaultAdmin}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#DCE8FD] bg-[#F4F8FF] px-3.5 py-2.5 text-xs font-bold text-[#2853AF] hover:bg-[#E8F2FF] transition-colors cursor-pointer"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Điền nhanh tài khoản quản trị mặc định</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

