import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  MapPin,
  Phone,
  Star,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from 'lucide-react';
import { hotelService, type HotelPayload } from '../../services/hotelService';
import { amenityService } from '../../services/amenityService';
import { roomService } from '../../services/roomService';
import type { AmenityRecord, HotelRecord, RoomRecord } from '../../types/models';
import {
  countRecordPhotos,
  extractErrorMessage,
  getRecordCoverPhotoUrl,
} from '../../lib/pocketbase';
import { parseCsvList } from '../../lib/formatters';
import { ActiveBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastProvider';
import { HotelFormModal } from './HotelFormModal';

export function HotelsPage() {
  const { notify } = useToast();
  const [hotels, setHotels] = useState<HotelRecord[]>([]);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [amenities, setAmenities] = useState<AmenityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HotelRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<HotelRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [h, r, a] = await Promise.all([
        hotelService.list(),
        roomService.list(),
        amenityService.list(),
      ]);
      setHotels(h);
      setRooms(r);
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

  const cities = useMemo(
    () => Array.from(new Set(hotels.map((h) => h.city).filter(Boolean))),
    [hotels],
  );

  const roomCountByHotel = useMemo(() => {
    const map: Record<string, number> = {};
    rooms.forEach((r) => {
      map[r.hotel] = (map[r.hotel] || 0) + 1;
    });
    return map;
  }, [rooms]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return hotels.filter((h) => {
      const okCity = !cityFilter || h.city === cityFilter;
      const okQuery =
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q);
      return okCity && okQuery;
    });
  }, [hotels, search, cityFilter]);

  const handleSave = async (payload: HotelPayload) => {
    setSaving(true);
    try {
      if (editing) {
        await hotelService.update(editing.id, payload);
        notify(`Đã cập nhật khách sạn "${payload.name}"`);
      } else {
        await hotelService.create(payload);
        notify(`Đã thêm mới khách sạn "${payload.name}"`);
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

  const handleToggleActive = async (hotel: HotelRecord) => {
    try {
      await hotelService.toggleActive(hotel.id, !hotel.active);
      notify(
        hotel.active
          ? `Đã tạm ẩn "${hotel.name}" khỏi ứng dụng`
          : `Đã mở hiển thị "${hotel.name}"`,
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
      await hotelService.remove(deleting.id);
      notify(`Đã xóa khách sạn "${deleting.name}"`, 'info');
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
            Quản lý Khách sạn
          </h1>
          <p className="mt-1 text-sm text-[#666D80]">
            Thêm, cập nhật khách sạn, tọa độ bản đồ GPS và tiện ích đi kèm ({hotels.length} khách sạn).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2853AF] to-[#3B7CE8] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#2853AF]/20 hover:brightness-105 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm khách sạn</span>
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
            placeholder="Tìm theo tên khách sạn, địa chỉ, tỉnh thành..."
            className="w-full rounded-xl border border-[#DFE1E6] bg-[#F6F8FA] pl-10 pr-4 py-2 text-sm focus:bg-white focus:border-[#2853AF] focus:outline-none"
          />
        </div>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-xl border border-[#DFE1E6] bg-white px-3.5 py-2 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
        >
          <option value="">Tất cả khu vực ({hotels.length})</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Hotels table */}
      <div className="rounded-2xl border border-[#ECEFF3] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F6F8FA] text-xs uppercase text-[#666D80]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Khách sạn</th>
                <th className="px-5 py-3.5 font-semibold">Khu vực & GPS</th>
                <th className="px-5 py-3.5 font-semibold">Phòng & Đánh giá</th>
                <th className="px-5 py-3.5 font-semibold">Tiện ích</th>
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
                    Đang tải danh sách khách sạn…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#666D80]">
                    Không tìm thấy khách sạn phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((h) => {
                  const amList = parseCsvList(h.amenities);
                  const coverUrl = getRecordCoverPhotoUrl('hotels', h, '240x180');
                  const photoCount = countRecordPhotos(h);
                  return (
                    <tr key={h.id} className="hover:bg-[#F9FBFF]">
                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex items-start gap-3">
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl border border-[#ECEFF3] bg-[#F2F6FC] flex items-center justify-center">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={h.name}
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
                            <p className="font-bold text-[#1A1B25] truncate">
                              {h.name}
                            </p>
                            <p className="mt-0.5 text-xs text-[#666D80] truncate">
                              {h.address}
                            </p>
                            {h.phone && (
                              <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#2853AF]">
                                <Phone className="h-3 w-3" /> {h.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#E8F2FF] px-2.5 py-1 text-xs font-bold text-[#2853AF]">
                          <MapPin className="h-3.5 w-3.5" /> {h.city}
                        </span>
                        {h.latitude !== 0 && h.longitude !== 0 && (
                          <p className="mt-1 font-mono text-[11px] text-[#666D80]">
                            {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-bold text-[#1A1B25]">
                          {roomCountByHotel[h.id] || 0} hạng phòng
                        </p>
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#666D80]">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-[#1A1B25]">
                            {h.rating > 0 ? h.rating.toFixed(1) : 'Mới'}
                          </span>
                          <span>({h.reviewCount} đánh giá)</span>
                        </p>
                      </td>
                      <td className="px-5 py-4 max-w-[220px]">
                        <div className="flex flex-wrap gap-1">
                          {amList.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-[#F6F8FA] border border-[#ECEFF3] px-2 py-0.5 text-[11px] font-medium text-[#666D80]"
                            >
                              {tag}
                            </span>
                          ))}
                          {amList.length > 3 && (
                            <span className="rounded-md bg-[#E8F2FF] px-1.5 py-0.5 text-[11px] font-bold text-[#2853AF]">
                              +{amList.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <ActiveBadge active={h.active} />
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(h)}
                            title={h.active ? 'Tạm ẩn' : 'Mở hiển thị'}
                            className="rounded-lg p-2 text-[#666D80] hover:bg-[#F6F8FA] hover:text-[#2853AF] cursor-pointer"
                          >
                            {h.active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(h);
                              setModalOpen(true);
                            }}
                            title="Chỉnh sửa"
                            className="rounded-lg p-2 text-[#666D80] hover:bg-[#E8F2FF] hover:text-[#2853AF] cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(h)}
                            title="Xóa khách sạn"
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

      <HotelFormModal
        open={modalOpen}
        editing={editing}
        amenitiesList={amenities}
        busy={saving}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa khách sạn?"
        message={`Bạn chắc chắn muốn xóa khách sạn "${deleting?.name}"? Hành động này không thể hoàn tác nếu khách sạn chưa có ràng buộc đơn hàng.`}
        busy={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

