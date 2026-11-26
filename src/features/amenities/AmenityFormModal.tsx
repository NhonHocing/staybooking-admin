import { useEffect, useState, type FormEvent } from 'react';
import type { AmenityCategory, AmenityRecord } from '../../types/models';
import type { AmenityPayload } from '../../services/amenityService';
import { ModalDrawer } from '../../components/ui/ModalDrawer';

interface AmenityFormModalProps {
  open: boolean;
  editing: AmenityRecord | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: AmenityPayload) => Promise<void>;
}

const ICON_OPTIONS = [
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'car', label: 'Bãi đỗ xe' },
  { value: 'clock', label: 'Lễ tân 24/7' },
  { value: 'bath', label: 'Phòng tắm' },
  { value: 'wind', label: 'Điều hòa' },
  { value: 'waves', label: 'Hồ bơi / Biển' },
  { value: 'utensils', label: 'Ăn uống / Buffet' },
  { value: 'plane', label: 'Đưa đón sân bay' },
  { value: 'sun', label: 'Ban công / Cảnh quan' },
  { value: 'dumbbell', label: 'Gym & Spa' },
  { value: 'building', label: 'Thang máy / Tòa nhà' },
  { value: 'sparkles', label: 'Tiện ích cao cấp' },
];

export function AmenityFormModal({
  open,
  editing,
  busy,
  onClose,
  onSubmit,
}: AmenityFormModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AmenityCategory>('both');
  const [icon, setIcon] = useState('sparkles');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editing) {
      setName(editing.name);
      setCategory(editing.category);
      setIcon(editing.icon || 'sparkles');
      setDescription(editing.description || '');
      setActive(editing.active);
    } else {
      setName('');
      setCategory('both');
      setIcon('sparkles');
      setDescription('');
      setActive(true);
    }
  }, [open, editing]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên tiện ích.');
      return;
    }
    setError(null);
    await onSubmit({
      name: name.trim(),
      category,
      icon,
      description: description.trim(),
      active,
    });
  };

  return (
    <ModalDrawer
      open={open}
      onClose={onClose}
      title={editing ? `Sửa tiện ích: ${editing.name}` : 'Thêm tiện ích mới'}
      subtitle="Tiện ích sẽ hiển thị ngay để chọn nhanh khi tạo hoặc sửa Khách sạn & Phòng"
      maxWidthClass="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#666D80] mb-1.5">
            Tên tiện ích *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Hồ bơi nước ấm, Bữa sáng miễn phí..."
            className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#666D80] mb-1.5">
              Áp dụng cho *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AmenityCategory)}
              className="w-full rounded-xl border border-[#DFE1E6] bg-white px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
            >
              <option value="hotel">Khách sạn</option>
              <option value="room">Phòng nghỉ</option>
              <option value="both">Cả Khách sạn & Phòng</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#666D80] mb-1.5">
              Nhóm biểu tượng
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full rounded-xl border border-[#DFE1E6] bg-white px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#666D80] mb-1.5">
            Mô tả ngắn
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả chi tiết tiện ích giúp lễ tân & khách nắm rõ..."
            className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm focus:border-[#2853AF] focus:outline-none"
          />
        </div>

        <label className="flex items-center justify-between rounded-xl border border-[#ECEFF3] px-4 py-3 cursor-pointer">
          <div>
            <p className="text-sm font-bold text-[#1A1B25]">Kích hoạt tiện ích</p>
            <p className="text-xs text-[#666D80]">
              Cho phép chọn tiện ích này trong biểu mẫu khách sạn và phòng
            </p>
          </div>
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-5 w-5 accent-[#2853AF]"
          />
        </label>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#ECEFF3]">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-xl border border-[#DFE1E6] px-4 py-2.5 text-sm font-semibold text-[#1A1B25] hover:bg-[#F6F8FA]"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-gradient-to-r from-[#2853AF] to-[#3B7CE8] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer"
          >
            {busy ? 'Đang lưu…' : editing ? 'Lưu tiện ích' : 'Thêm tiện ích'}
          </button>
        </div>
      </form>
    </ModalDrawer>
  );
}

