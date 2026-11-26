import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Users,
  Maximize2,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from 'lucide-react';
import { roomService, type RoomPayload } from '../../services/roomService';
import { hotelService } from '../../services/hotelService';
import { amenityService } from '../../services/amenityService';
import type {
  AmenityRecord,
  HotelRecord,
  RoomRecord,
} from '../../types/models';
import {
  countRecordPhotos,
  extractErrorMessage,
  getRecordCoverPhotoUrl,
} from '../../lib/pocketbase';
import { formatVnd, parseCsvList } from '../../lib/formatters';
import { ActiveBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastProvider';
import { RoomFormModal } from './RoomFormModal';

export function RoomsPage() {
  const { notify } = useToast();
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [hotels, setHotels] = useState<HotelRecord[]>([]);
  const [amenities, setAmenities] = useState<AmenityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotelFilter, setHotelFilter] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RoomRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<RoomRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, h, a] = await Promise.all([
        roomService.list(),
        hotelService.list(),
        amenityService.list(),
      ]);
      setRooms(r);
      setHotels(h);
      setAmenities(a);
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const hotelNameMap = useMemo(() => {
    const map: Record<string, HotelRecord> = {};
    hotels.forEach((h) => {
      map[h.id] = h;
    });
    return map;
  }, [hotels]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms.filter((r) => {
      const okHotel = !hotelFilter || r.hotel === hotelFilter;
      const hName = (
        r.expand?.hotel?.name ||
        hotelNameMap[r.hotel]?.name ||
        ''
      ).toLowerCase();
      const okQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        hName.includes(q) ||
        r.bedType.toLowerCase().includes(q);
      return okHotel && okQuery;
    });
  }, [rooms, hotelFilter, search, hotelNameMap]);

  const handleSave = async (payload: RoomPayload) => {
    setSaving(true);
    try {
      if (editing) {
        await roomService.update(editing.id, payload);
        notify(`Đã cập nhật phòng "${payload.name}"`);
      } else {
        await roomService.create(payload);
        notify(`Đã thêm phòng mới "${payload.name}"`);
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

  const handleToggleActive = async (room: RoomRecord) => {
    try {
      await roomService.toggleActive(room.id, !room.active);
      notify(
        room.active
          ? `Đã tạm đóng phòng "${room.name}"`
          : `Đã mở nhận đặt phòng "${room.name}"`,
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
      await roomService.remove(deleting.id);
      notify(`Đã xóa phòng "${deleting.name}"`, 'info');
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
            Quản lý Phòng nghỉ
          </h1>
          <p className="mt-1 text-sm text-[#666D80]">
            Kiểm tra tồn kho phòng, cập nhật giá/đêm, sức chứa và tiện nghi theo từng khách sạn ({rooms.length} phòng).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          disabled={hotels.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2853AF] to-[#3B7CE8] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#2853AF]/20 hover:brightness-105 disabled:opacity-50 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm phòng mới</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#ECEFF3] bg-white p-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-[#666D80] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên phòng, tên khách sạn, loại giường..."
            className="w-full rounded-xl border border-[#DFE1E6] bg-[#F6F8FA] pl-10 pr-4 py-2 text-sm focus:bg-white focus:border-[#2853AF] focus:outline-none"
          />
        </div>
        <select
          value={hotelFilter}
          onChange={(e) => setHotelFilter(e.target.value)}
          className="rounded-xl border border-[#DFE1E6] bg-white px-3.5 py-2 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
        >
          <option value="">Tất cả khách sạn ({rooms.length} phòng)</option>
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name} — {h.city}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-[#ECEFF3] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F6F8FA] text-xs uppercase text-[#666D80]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Phòng & Khách sạn</th>
                <th className="px-5 py-3.5 font-semibold">Thông số</th>
                <th className="px-5 py-3.5 font-semibold">Giá / đêm</th>
                <th className="px-5 py-3.5 font-semibold">Tiện nghi</th>
                <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-3.5 font-semibold text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEFF3]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#666D80]">
                    Đang tải danh sách phòng…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#666D80]">
                    Không có phòng phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const hotel = r.expand?.hotel || hotelNameMap[r.hotel];
                  const tags = parseCsvList(r.amenities);
                  const coverUrl = getRecordCoverPhotoUrl('rooms', r, '240x180');
                  const photoCount = countRecordPhotos(r);
                  return (
                    <tr key={r.id} className="hover:bg-[#F9FBFF]">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl border border-[#ECEFF3] bg-[#F2F6FC] flex items-center justify-center">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={r.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-[#94A3B8]" />
                            )}
                            {photoCount > 0 && (
                              <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 py-px text-[9px] font-bold text-white">
                                {photoCount}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#1A1B25]">{r.name}</p>
                            <p className="mt-0.5 text-xs font-medium text-[#2853AF]">
                              {hotel ? `${hotel.name} · ${hotel.city}` : r.hotel}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-[#666D80]">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 font-semibold text-[#1A1B25]">
                            <Users className="h-3.5 w-3.5 text-[#2853AF]" />
                            {r.capacity} khách
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Maximize2 className="h-3.5 w-3.5" />
                            {r.sizeM2 || 28} m²
                          </span>
                        </div>
                        <p className="mt-1">{r.bedType || '1 giường đôi'}</p>
                      </td>
                      <td className="px-5 py-4 font-extrabold text-[#2853AF] whitespace-nowrap">
                        {formatVnd(r.price)}
                      </td>
                      <td className="px-5 py-4 max-w-[220px]">
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="rounded-md bg-[#F6F8FA] border border-[#ECEFF3] px-2 py-0.5 text-[11px] font-medium text-[#666D80]"
                            >
                              {t}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="rounded-md bg-[#E8F2FF] px-1.5 py-0.5 text-[11px] font-bold text-[#2853AF]">
                              +{tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <ActiveBadge active={r.active} />
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(r)}
                            title={r.active ? 'Tạm ẩn phòng' : 'Mở phòng'}
                            className="rounded-lg p-2 text-[#666D80] hover:bg-[#F6F8FA] hover:text-[#2853AF] cursor-pointer"
                          >
                            {r.active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(r);
                              setModalOpen(true);
                            }}
                            title="Sửa phòng"
                            className="rounded-lg p-2 text-[#666D80] hover:bg-[#E8F2FF] hover:text-[#2853AF] cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(r)}
                            title="Xóa phòng"
                            className="rounded-lg p-2 text-[#666D80] hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
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

      <RoomFormModal
        open={modalOpen}
        editing={editing}
        hotels={hotels}
        amenitiesList={amenities}
        defaultHotelId={hotelFilter || undefined}
        busy={saving}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa hạng phòng?"
        message={`Bạn có chắc muốn xóa phòng "${deleting?.name}"? Phòng đã có đơn đặt liên kết sẽ không thể xóa để bảo toàn dữ liệu lịch sử.`}
        busy={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

