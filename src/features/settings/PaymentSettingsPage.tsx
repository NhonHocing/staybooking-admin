import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Building,
  CheckCircle2,
  CreditCard,
  QrCode,
  RefreshCw,
  Save,
  Sparkles,
} from 'lucide-react';
import {
  buildVietQrPreviewUrl,
  DEFAULT_VIETQR_CONFIG,
  paymentSettingsService,
  VIETQR_BANKS,
} from '../../services/paymentSettingsService';
import { extractErrorMessage } from '../../lib/pocketbase';
import { useToast } from '../../components/ui/ToastProvider';
import { formatVnd } from '../../lib/formatters';

export function PaymentSettingsPage() {
  const { notify } = useToast();
  const [recordId, setRecordId] = useState<string | null>(null);
  const [bankCode, setBankCode] = useState(DEFAULT_VIETQR_CONFIG.bankCode);
  const [bankName, setBankName] = useState(DEFAULT_VIETQR_CONFIG.bankName);
  const [accountNumber, setAccountNumber] = useState(
    DEFAULT_VIETQR_CONFIG.accountNumber,
  );
  const [accountName, setAccountName] = useState(
    DEFAULT_VIETQR_CONFIG.accountName,
  );
  const [template, setTemplate] = useState(DEFAULT_VIETQR_CONFIG.template);
  const [sampleAmount, setSampleAmount] = useState('1500000');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rec = await paymentSettingsService.getVietQr();
      if (rec) {
        setRecordId(rec.id);
        setBankCode(rec.bankCode || DEFAULT_VIETQR_CONFIG.bankCode);
        setBankName(rec.bankName || DEFAULT_VIETQR_CONFIG.bankName);
        setAccountNumber(
          rec.accountNumber || DEFAULT_VIETQR_CONFIG.accountNumber,
        );
        setAccountName(rec.accountName || DEFAULT_VIETQR_CONFIG.accountName);
        setTemplate(rec.template || DEFAULT_VIETQR_CONFIG.template);
        setUpdatedAt(rec.updated || null);
      }
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleBankChange = (newCode: string) => {
    setBankCode(newCode);
    const matched = VIETQR_BANKS.find((b) => b.code === newCode);
    if (matched) {
      setBankName(matched.name);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanStk = accountNumber.trim().replace(/\s+/g, '');
    if (!bankCode.trim() || !cleanStk || !accountName.trim()) {
      notify('Vui lòng nhập đầy đủ Ngân hàng, Số tài khoản và Tên chủ tài khoản.', 'error');
      return;
    }
    setSaving(true);
    try {
      const saved = await paymentSettingsService.saveVietQr(recordId, {
        bankCode,
        bankName: bankName.trim() || bankCode.trim().toUpperCase(),
        accountNumber: cleanStk,
        accountName,
        template,
      });
      setRecordId(saved.id);
      setAccountNumber(saved.accountNumber);
      setAccountName(saved.accountName);
      setUpdatedAt(saved.updated || null);
      notify(
        'Đã lưu cấu hình STK VietQR! App Mobile sẽ tự cập nhật mã QR theo thời gian thực.',
      );
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const numericAmount = Math.max(10000, Math.round(Number(sampleAmount) || 1500000));
  const previewUrl = buildVietQrPreviewUrl(
    { bankCode, accountNumber, accountName, template },
    numericAmount,
    'TT SB-DEMO01',
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1B25]">
            Cấu hình STK nhận chuyển khoản VietQR
          </h1>
          <p className="mt-1 text-sm text-[#666D80]">
            Thay đổi ngân hàng, số tài khoản và chủ tài khoản — mã VietQR trên app Flutter Mobile sẽ tự động sinh lại theo cấu hình này.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DFE1E6] bg-white px-4 py-2 text-sm font-semibold text-[#1A1B25] hover:bg-[#F6F8FA] cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Tải lại</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form cấu hình */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 rounded-2xl border border-[#ECEFF3] bg-white p-6 space-y-5"
        >
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#ECEFF3]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F2FF] text-[#2853AF]">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1A1B25]">
                  Thông tin tài khoản ngân hàng
                </h2>
                <p className="text-xs text-[#666D80]">
                  Áp dụng chuẩn NAPAS 247 / VietQR chính thức
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Đồng bộ Real-time
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#666D80] mb-1.5">
                Ngân hàng nhận thanh toán *
              </label>
              <select
                value={
                  VIETQR_BANKS.some((b) => b.code === bankCode)
                    ? bankCode
                    : '__custom__'
                }
                onChange={(e) => {
                  if (e.target.value !== '__custom__') {
                    handleBankChange(e.target.value);
                  }
                }}
                className="w-full rounded-xl border border-[#DFE1E6] bg-white px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none focus:ring-2 focus:ring-[#2853AF]/15"
              >
                {VIETQR_BANKS.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} — {b.name}
                  </option>
                ))}
                {!VIETQR_BANKS.some((b) => b.code === bankCode) && (
                  <option value="__custom__">
                    Khác ({bankCode})
                  </option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#666D80] mb-1.5">
                Mã ngân hàng VietQR (BIN / ShortName) *
              </label>
              <input
                type="text"
                required
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value.toUpperCase())}
                placeholder="VD: MB, VCB, TCB, ACB..."
                className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-mono font-bold uppercase focus:border-[#2853AF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#666D80] mb-1.5">
                Mẫu hiển thị QR
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full rounded-xl border border-[#DFE1E6] bg-white px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
              >
                <option value="compact2">compact2 (Đầy đủ logo + số tiền)</option>
                <option value="compact">compact (Gọn nhẹ)</option>
                <option value="qr_only">qr_only (Chỉ khung mã QR)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#666D80] mb-1.5">
                Tên ngân hàng hiển thị trên App Mobile *
              </label>
              <div className="relative">
                <Building className="h-4 w-4 text-[#666D80] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="VD: MBBank (Ngân hàng Quân Đội)"
                  className="w-full rounded-xl border border-[#DFE1E6] pl-10 pr-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#666D80] mb-1.5">
                Số tài khoản (STK) *
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Nhập số tài khoản ngân hàng thật của bạn..."
                className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-base font-mono font-extrabold tracking-wide text-[#2853AF] focus:border-[#2853AF] focus:outline-none focus:ring-2 focus:ring-[#2853AF]/15"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#666D80] mb-1.5">
                Tên chủ tài khoản (Không dấu, in hoa) *
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                placeholder="VD: DO DANG HOANG NHON"
                className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-bold uppercase focus:border-[#2853AF] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#ECEFF3]">
            <p className="text-xs text-[#666D80]">
              {updatedAt
                ? `Cập nhật gần nhất: ${updatedAt.slice(0, 19).replace('T', ' ')}`
                : 'Đang dùng cấu hình mặc định'}
            </p>
            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2853AF] to-[#3B7CE8] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#2853AF]/20 hover:brightness-105 disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Đang lưu…' : 'Lưu cấu hình STK VietQR'}</span>
            </button>
          </div>
        </form>

        {/* Xem trước mã VietQR trực tiếp */}
        <div className="lg:col-span-5 rounded-2xl border border-[#ECEFF3] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-[#2853AF]" />
              <h2 className="text-base font-bold text-[#1A1B25]">
                Xem trước mã VietQR
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#E8F2FF] px-2 py-0.5 text-[11px] font-bold text-[#2853AF]">
              <Sparkles className="h-3 w-3" /> Live
            </span>
          </div>

          <div className="flex flex-col items-center rounded-2xl border border-[#D5E4FD] bg-[#F8FAFF] p-4">
            <div className="rounded-2xl bg-white p-3 shadow-sm border border-[#ECEFF3]">
              <img
                src={previewUrl}
                alt="Xem trước mã VietQR"
                className="h-60 w-60 object-contain"
              />
            </div>
            <div className="mt-4 w-full space-y-1.5 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-[#666D80]">Ngân hàng</span>
                <span className="font-bold text-[#1A1B25] text-right">
                  {bankName || bankCode}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#666D80]">Số tài khoản</span>
                <span className="font-mono font-extrabold text-[#2853AF]">
                  {accountNumber || '—'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#666D80]">Chủ tài khoản</span>
                <span className="font-bold text-[#1A1B25] text-right">
                  {accountName || '—'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#666D80]">Số tiền thử nghiệm</span>
                <span className="font-extrabold text-emerald-700">
                  {formatVnd(numericAmount)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#666D80] mb-1">
              Thử thay đổi số tiền xem trước (VNĐ)
            </label>
            <input
              type="number"
              min={10000}
              step={50000}
              value={sampleAmount}
              onChange={(e) => setSampleAmount(e.target.value)}
              className="w-full rounded-xl border border-[#DFE1E6] bg-[#F6F8FA] px-3 py-2 text-xs font-bold text-[#1A1B25] focus:bg-white focus:border-[#2853AF] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
