import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Plus, TicketPercent, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  couponService,
  type CouponPayload,
} from '../../services/couponService';
import type { CouponRecord } from '../../types/models';
import { extractErrorMessage } from '../../lib/pocketbase';
import { formatVnd } from '../../lib/formatters';
import { ActiveBadge } from '../../components/ui/StatusBadge';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastProvider';

export function CouponsPage() {
  const { notify } = useToast();
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CouponRecord | null>(null);
  const [deleting, setDeleting] = useState<CouponRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState('10');
  const [minTotal, setMinTotal] = useState('500000');
  const [active, setActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCoupons(await couponService.list());
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const openForm = (record: CouponRecord | null) => {
    setEditing(record);
    if (record) {
      setCode(record.code);
      if (record.discountPercent > 0) {
        setDiscountType('percent');
        setValue(String(record.discountPercent));
      } else {
        setDiscountType('fixed');
        setValue(String(record.discountAmount));
      }
      setMinTotal(String(record.minTotal || 0));
      setActive(record.active);
    } else {
      setCode('');
      setDiscountType('percent');
      setValue('10');
      setMinTotal('500000');
      setActive(true);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const numVal = Math.round(Number(value));
    const numMin = Math.max(0, Math.round(Number(minTotal) || 0));
    if (!code.trim() || numVal <= 0) {
      notify('Vui lòng nhập mã giảm giá và mức giảm hợp lệ.', 'error');
      return;
    }
    const payload: CouponPayload = {
      code: code.trim().toUpperCase(),
      discountPercent: discountType === 'percent' ? Math.min(100, numVal) : 0,
      discountAmount: discountType === 'fixed' ? numVal : 0,
      minTotal: numMin,
      active,
    };
    setSaving(true);
    try {
      if (editing) {
        await couponService.update(editing.id, payload);
        notify(`Đã cập nhật mã "${payload.code}"`);
      } else {
        await couponService.create(payload);
        notify(`Đã tạo mã giảm giá "${payload.code}"`);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c: CouponRecord) => {
    try {
      await couponService.update(c.id, { active: !c.active });
      notify(
        c.active ? `Đã tạm tắt mã "${c.code}"` : `Đã bật mã "${c.code}"`,
        'info',
      );
      await load();
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await couponService.remove(deleting.id);
      notify(`Đã xóa mã "${deleting.code}"`, 'info');
      setDeleting(null);
      await load();
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1B25]">
            Quản lý Mã giảm giá (Voucher)
          </h1>
          <p className="mt-1 text-sm text-[#666D80]">
            Tạo và bật/tắt mã khuyến mãi áp dụng trực tiếp tại màn hình thanh toán trên Mobile.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openForm(null)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2853AF] to-[#3B7CE8] px-4 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-105 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo mã giảm giá</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-[#666D80]">
          Đang tải danh sách voucher…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-[#ECEFF3] bg-white p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-[#E8F2FF] px-3 py-1.5 text-sm font-extrabold font-mono text-[#2853AF]">
                    <TicketPercent className="h-4 w-4" />
                    {c.code}
                  </div>
                  <ActiveBadge active={c.active} />
                </div>
                <p className="mt-4 text-xl font-extrabold text-[#1A1B25]">
                  {c.discountPercent > 0
                    ? `Giảm ${c.discountPercent}%`
                    : `Giảm ${formatVnd(c.discountAmount)}`}
                </p>
                <p className="mt-1 text-xs text-[#666D80]">
                  Đơn tối thiểu: <strong className="text-[#1A1B25]">{formatVnd(c.minTotal)}</strong>
                </p>
              </div>
              <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-[#ECEFF3]">
                <button
                  type="button"
                  onClick={() => handleToggle(c)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#666D80] hover:bg-[#F6F8FA] cursor-pointer"
                >
                  {c.active ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" /> Tắt
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" /> Bật
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => openForm(c)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#2853AF] hover:bg-[#E8F2FF] cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" /> Sửa
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(c)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalDrawer
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Sửa mã ${editing.code}` : 'Tạo mã giảm giá mới'}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#666D80] mb-1.5">
              Mã voucher *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: STAY2026"
              className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-mono font-bold uppercase focus:border-[#2853AF] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#666D80] mb-1.5">
                Kiểu giảm
              </label>
              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as 'percent' | 'fixed')
                }
                className="w-full rounded-xl border border-[#DFE1E6] bg-white px-3 py-2.5 text-sm font-medium"
              >
                <option value="percent">Theo phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (₫)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#666D80] mb-1.5">
                Giá trị giảm *
              </label>
              <input
                type="number"
                min={1}
                max={discountType === 'percent' ? 100 : 10000000}
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-bold text-[#2853AF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#666D80] mb-1.5">
              Giá trị đơn tối thiểu (VNĐ)
            </label>
            <input
              type="number"
              min={0}
              step={50000}
              value={minTotal}
              onChange={(e) => setMinTotal(e.target.value)}
              className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-medium"
            />
          </div>

          <label className="flex items-center justify-between rounded-xl border border-[#ECEFF3] px-4 py-3 cursor-pointer">
            <span className="text-sm font-bold text-[#1A1B25]">
              Đang áp dụng
            </span>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-5 w-5 accent-[#2853AF]"
            />
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#ECEFF3]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-[#DFE1E6] px-4 py-2 text-sm font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#2853AF] px-5 py-2 text-sm font-bold text-white cursor-pointer"
            >
              {saving ? 'Đang lưu…' : 'Lưu mã'}
            </button>
          </div>
        </form>
      </ModalDrawer>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa mã giảm giá?"
        message={`Xóa vĩnh viễn mã "${deleting?.code}" khỏi hệ thống?`}
        busy={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

