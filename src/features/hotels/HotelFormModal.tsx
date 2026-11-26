import { useEffect, useState, type FormEvent } from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import type { AmenityRecord, HotelRecord } from '../../types/models';
import type { HotelPayload } from '../../services/hotelService';
import { VIETNAM_PROVINCES_34 } from '../../lib/vietnamProvinces';
import { parseCsvList, toCsvList } from '../../lib/formatters';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import { PhotoUploader } from '../../components/ui/PhotoUploader';

interface HotelFormModalProps {
  open: boolean;
  editing: HotelRecord | null;
  amenitiesList: AmenityRecord[];
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: HotelPayload) => Promise<void>;
}

export function HotelFormModal({
  open,
  editing,
  amenitiesList,
  busy,
  onClose,
  onSubmit,
}: HotelFormModalProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Cần Thơ');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [latitude, setLatitude] = useState('10.0329');
  const [longitude, setLongitude] = useState('105.7875');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('12:00');
  const [description, setDescription] = useState('');
  const [policy, setPolicy] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [active, setActive] = useState(true);
  const [externalImages, setExternalImages] = useState('');
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [removedPhotos, setRemovedPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setNewPhotos([]);
    setRemovedPhotos([]);
    if (editing) {
      setName(editing.name);
      setCity(editing.city || 'Cần Thơ');
      setAddress(editing.address || '');
      setPhone(editing.phone || '');
      setLatitude(String(editing.latitude || ''));
      setLongitude(String(editing.longitude || ''));
      setCheckInTime(editing.checkInTime || '14:00');
      setCheckOutTime(editing.checkOutTime || '12:00');
      setDescription(editing.description || '');
      setPolicy(
        editing.policy ||
          'Miễn phí hủy phòng trước ngày nhận phòng 24 giờ.',
      );
      setSelectedAmenities(parseCsvList(editing.amenities));
      setExternalImages(editing.images || '');
      setActive(editing.active);
    } else {
      const def = VIETNAM_PROVINCES_34.find((p) => p.name === 'Cần Thơ')!;
      setName('');
      setCity(def.name);
      setAddress('');
      setPhone('');
      setLatitude(String(def.defaultLat));
      setLongitude(String(def.defaultLng));
      setCheckInTime('14:00');
      setCheckOutTime('12:00');
      setDescription('');
      setPolicy(
        'Miễn phí hủy phòng trước ngày nhận phòng 24 giờ. Nhận phòng sớm tùy thuộc tình trạng phòng thực tế.',
      );
      setSelectedAmenities(['Wi-Fi', 'Bãi đỗ xe', 'Lễ tân 24/7']);
      setExternalImages('');
      setActive(true);
    }
    setCustomAmenity('');
  }, [open, editing]);

  const toggleRemoveExistingPhoto = (filename: string) => {
    setRemovedPhotos((prev) =>
      prev.includes(filename)
        ? prev.filter((item) => item !== filename)
        : [...prev, filename],
    );
  };

  const hotelAmenities = amenitiesList.filter(
    (a) => a.active && (a.category === 'hotel' || a.category === 'both'),
  );

  const toggleAmenity = (label: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    );
  };

  const applyProvinceCoords = (provinceName: string) => {
    setCity(provinceName);
    const found = VIETNAM_PROVINCES_34.find((p) => p.name === provinceName);
    if (found && !editing) {
      setLatitude(String(found.defaultLat));
      setLongitude(String(found.defaultLng));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !description.trim()) {
      setError('Vui lòng nhập đầy đủ Tên khách sạn, Địa chỉ và Mô tả.');
      return;
    }
    const allAmenities = [...selectedAmenities];
    if (customAmenity.trim()) {
      allAmenities.push(...parseCsvList(customAmenity));
    }
    setError(null);
    await onSubmit({
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      phone: phone.trim(),
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      checkInTime: checkInTime.trim() || '14:00',
      checkOutTime: checkOutTime.trim() || '12:00',
      description: description.trim(),
      policy: policy.trim(),
      amenities: toCsvList(allAmenities) || 'Wi-Fi',
      images: externalImages.trim(),
      active,
      newPhotos,
      removePhotos: removedPhotos,
    });
  };

  return (
    <ModalDrawer
      open={open}
      onClose={onClose}
      title={editing ? `Chỉnh sửa: ${editing.name}` : 'Thêm khách sạn mới'}
      subtitle="Đồng bộ trực tiếp với danh sách khách sạn và bản đồ GPS trên ứng dụng Mobile"
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#666D80] mb-1.5">
              Tên khách sạn *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Ninh Kiều Riverside Hotel"
              className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none focus:ring-2 focus:ring-[#2853AF]/15"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#666D80] mb-1.5">
              Tỉnh / Thành phố (34 tỉnh sau sáp nhập) *
            </label>
            <select
              value={city}
              onChange={(e) => applyProvinceCoords(e.target.value)}
              className="w-full rounded-xl border border-[#DFE1E6] bg-white px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
            >
              {!VIETNAM_PROVINCES_34.some((p) => p.name === city) && city && (
                <option value={city}>{city} (Địa danh hiện tại)</option>
              )}
              {VIETNAM_PROVINCES_34.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} — {p.mergedNote}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#666D80] mb-1.5">
              Số điện thoại lễ tân
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0292 3812 668"
              className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#666D80] mb-1.5">
              Địa chỉ chi tiết *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, tên đường, phường/xã..."
              className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#666D80] mb-1.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#2853AF]" />
              Vĩ độ GPS (Latitude)
            </label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-mono focus:border-[#2853AF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#666D80] mb-1.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#2853AF]" />
              Kinh độ GPS (Longitude)
            </label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-mono focus:border-[#2853AF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#666D80] mb-1.5">
              Giờ nhận phòng (Check-in)
            </label>
            <input
              type="text"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#666D80] mb-1.5">
              Giờ trả phòng (Check-out)
            </label>
            <input
              type="text"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
            />
          </div>
        </div>

        {/* Thư viện ảnh khách sạn */}
        <PhotoUploader
          collection="hotels"
          recordId={editing?.id}
          existingPhotos={editing?.photos || []}
          removedPhotos={removedPhotos}
          newFiles={newPhotos}
          externalImages={externalImages}
          label="Ảnh khách sạn"
          helperText="Tải lên tối đa 8 ảnh (JPG, PNG, WebP · ≤10MB/ảnh). Ảnh đầu tiên làm ảnh bìa trên danh sách và bản đồ app Mobile."
          onChangeNewFiles={setNewPhotos}
          onToggleRemoveExisting={toggleRemoveExistingPhoto}
          onChangeExternalImages={setExternalImages}
        />

        {/* Tiện ích từ bảng amenities */}
        <div className="rounded-2xl border border-[#ECEFF3] bg-[#F8FAFD] p-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="h-4 w-4 text-[#2853AF]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2853AF]">
              Chọn tiện ích khách sạn
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hotelAmenities.map((item) => {
              const checked = selectedAmenities.includes(item.name);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleAmenity(item.name)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    checked
                      ? 'border-[#2853AF] bg-[#2853AF] text-white shadow-xs'
                      : 'border-[#DFE1E6] bg-white text-[#1A1B25] hover:border-[#2853AF]/50'
                  }`}
                >
                  {checked ? '✓ ' : '+ '}
                  {item.name}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            placeholder="Thêm tiện ích bổ sung khác (ngăn cách bằng dấu phẩy)..."
            className="mt-3 w-full rounded-xl border border-[#DFE1E6] bg-white px-3 py-2 text-xs focus:border-[#2853AF] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#666D80] mb-1.5">
            Mô tả khách sạn *
          </label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Giới thiệu nổi bật về vị trí, không gian, tầm nhìn..."
            className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm focus:border-[#2853AF] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#666D80] mb-1.5">
            Chính sách hủy & lưu trú
          </label>
          <textarea
            rows={2}
            value={policy}
            onChange={(e) => setPolicy(e.target.value)}
            className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm focus:border-[#2853AF] focus:outline-none"
          />
        </div>

        <label className="flex items-center justify-between rounded-xl border border-[#ECEFF3] px-4 py-3 cursor-pointer">
          <div>
            <p className="text-sm font-bold text-[#1A1B25]">
              Hiển thị trên ứng dụng Mobile
            </p>
            <p className="text-xs text-[#666D80]">
              Tắt nếu muốn tạm ẩn khách sạn khỏi trang tìm kiếm của khách hàng
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
            {busy
              ? 'Đang lưu…'
              : editing
                ? 'Cập nhật khách sạn'
                : 'Tạo khách sạn'}
          </button>
        </div>
      </form>
    </ModalDrawer>
  );
}

