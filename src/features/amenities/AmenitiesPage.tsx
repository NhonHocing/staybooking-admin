import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Sparkles,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  amenityService,
  type AmenityPayload,
} from '../../services/amenityService';
import type { AmenityRecord } from '../../types/models';
import { extractErrorMessage } from '../../lib/pocketbase';
import { ActiveBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastProvider';
import { AmenityFormModal } from './AmenityFormModal';

const CATEGORY_LABELS: Record<string, { label: string; cls: string }> = {
  hotel: { label: 'Khách sạn', cls: 'bg-blue-50 text-[#2853AF] border-blue-200' },
  room: { label: 'Phòng nghỉ', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  both: { label: 'Khách sạn & Phòng', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
};

export function AmenitiesPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<AmenityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AmenityRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<AmenityRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await amenityService.list());
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((a) => {
      const okCat = !catFilter || a.category === catFilter;
      const okQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q);
      return okCat && okQuery;
    });
  }, [items, search, catFilter]);

  const handleSave = async (payload: AmenityPayload) => {
    setSaving(true);
    try {
      if (editing) {
        await amenityService.update(editing.id, payload);
        notify(`Đã cập nhật tiện ích "${payload.name}"`);
      } else {
        await amenityService.create(payload);
        notify(`Đã thêm mới tiện ích "${payload.name}"`);
      }
      setModalOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item: AmenityRecord) => {
    try {
      await amenityService.toggleActive(item.id, !item.active);
      notify(
        item.active
          ? `Đã ẩn tiện ích "${item.name}"`
          : `Đã kích hoạt tiện ích "${item.name}"`,
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
      await amenityService.remove(deleting.id);
      notify(`Đã xóa tiện ích "${deleting.name}"`, 'info');
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
            Danh mục Tiện ích
          </h1>
          <p className="mt-1 text-sm text-[#666D80]">
            Quản lý các tiện ích chuẩn hóa để gắn nhanh cho Khách sạn và Phòng nghỉ ({items.length} tiện ích).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2853AF] to-[#3B7CE8] px-4 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-105 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm tiện ích</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#ECEFF3] bg-white p-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-[#666D80] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc mô tả tiện ích..."
            className="w-full rounded-xl border border-[#DFE1E6] bg-[#F6F8FA] pl-10 pr-4 py-2 text-sm focus:bg-white focus:border-[#2853AF] focus:outline-none"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="rounded-xl border border-[#DFE1E6] bg-white px-3.5 py-2 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
        >
          <option value="">Tất cả phân loại</option>
          <option value="hotel">Khách sạn</option>
          <option value="room">Phòng nghỉ</option>
          <option value="both">Khách sạn & Phòng</option>
        </select>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-[#666D80]">
          Đang tải danh mục tiện ích…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#ECEFF3] bg-white p-12 text-center text-sm text-[#666D80]">
          Không tìm thấy tiện ích nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const cat = CATEGORY_LABELS[item.category] ?? CATEGORY_LABELS.both;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-[#ECEFF3] bg-white p-5 shadow-[0_4px_18px_rgba(23,50,116,0.03)] flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-[#E8F2FF] text-[#2853AF] flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#1A1B25] truncate">
                          {item.name}
                        </h3>
                        <span
                          className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cat.cls}`}
                        >
                          {cat.label}
                        </span>
                      </div>
                    </div>
                    <ActiveBadge active={item.active} />
                  </div>
                  <p className="mt-3 text-xs text-[#666D80] leading-relaxed">
                    {item.description || 'Chưa có mô tả chi tiết.'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-[#ECEFF3]">
                  <button
                    type="button"
                    onClick={() => handleToggle(item)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#666D80] hover:bg-[#F6F8FA] hover:text-[#2853AF] cursor-pointer"
                  >
                    {item.active ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Ẩn
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Mở
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(item);
                      setModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#2853AF] hover:bg-[#E8F2FF] cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(item)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AmenityFormModal
        open={modalOpen}
        editing={editing}
        busy={saving}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa tiện ích?"
        message={`Bạn chắc chắn muốn xóa tiện ích "${deleting?.name}" khỏi danh mục chuẩn?`}
        busy={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

