import { useEffect, useState, type FormEvent } from 'react';
import { Sparkles } from 'lucide-react';
import type {
  AmenityRecord,
  HotelRecord,
  RoomRecord,
} from '../../types/models';
import type { RoomPayload } from '../../services/roomService';
import { parseCsvList, toCsvList } from '../../lib/formatters';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import { PhotoUploader } from '../../components/ui/PhotoUploader';

interface RoomFormModalProps {
  open: boolean;
  editing: RoomRecord | null;
  hotels: HotelRecord[];
  amenitiesList: AmenityRecord[];
  defaultHotelId?: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: RoomPayload) => Promise<void>;
}

export function RoomFormModal({
  open,
  editing,
  hotels,
  amenitiesList,
  defaultHotelId,
  busy,
  onClose,
  onSubmit,
}: RoomFormModalProps) {
  const [hotel, setHotel] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('750000');
  const [capacity, setCapacity] = useState('2');
  const [sizeM2, setSizeM2] = useState('30');
  const [bedType, setBedType] = useState('1 giường đôi lớn (King)');
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
      setHotel(editing.hotel);
      setName(editing.name);
      setPrice(String(editing.price));
      setCapacity(String(editing.capacity));
      setSizeM2(String(editing.sizeM2 || 28));
      setBedType(editing.bedType || '1 giường đôi lớn (King)');
      setSelectedAmenities(parseCsvList(editing.amenities));
      setExternalImages(editing.images || '');
      setActive(editing.active);
    } else {
      setHotel(defaultHotelId || hotels[0]?.id || '');
      setName('');
      setPrice('750000');
      setCapacity('2');
      setSizeM2('30');
      setBedType('1 giường đôi lớn (King)');
      setSelectedAmenities(['Wi-Fi', 'Phòng tắm riêng', 'Điều hòa']);
      setExternalImages('');
      setActive(true);
    }
    setCustomAmenity('');
  }, [open, editing, hotels, defaultHotelId]);

  const toggleRemoveExistingPhoto = (filename: string) => {
    setRemovedPhotos((prev) =>
      prev.includes(filename)
        ? prev.filter((item) => item !== filename)
        : [...prev, filename],
    );
  };

  const roomAmenities = amenitiesList.filter(
    (a) => a.active && (a.category === 'room' || a.category === 'both'),
  );

  const toggleAmenity = (label: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const numericPrice = Math.round(Number(price));
    const numericCap = Math.round(Number(capacity));
    const numericSize = Math.round(Number(sizeM2));

    if (!hotel || !name.trim() || numericPrice < 100000 || numericCap < 1) {
      setError('Vui lòng chọn khách sạn, nhập tên phòng, giá >= 100.000₫ và sức chứa >= 1.');
      return;
    }

    const allAmenities = [...selectedAmenities];
    if (customAmenity.trim()) {
      allAmenities.push(...parseCsvList(customAmenity));
    }
    setError(null);
    await onSubmit({
      hotel,
      name: name.trim(),
      price: numericPrice,
      capacity: numericCap,
      sizeM2: Math.max(10, numericSize || 25),
      bedType: bedType.trim() || '1 giường đôi lớn (King)',
      amenities: toCsvList(allAmenities) || 'Wi-Fi, Phòng tắm riêng',
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
      title={editing ? `Chỉnh sửa phòng ${editing.name}` : 'Thêm hạng phòng mới'}
      subtitle="Phòng sẽ xuất hiện ngay trong mục chọn phòng & báo giá trên app Mobile"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#666D80] mb-1.5">
            Thuộc khách sạn *
          </label>
          <select
            required
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            className="w-full rounded-xl border border-[#DFE1E6] bg-white px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
          >
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.city})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#666D80] mb-1.5">
              Tên hạng phòng *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Deluxe 302, Suite Panorama 501"
              className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#666D80] mb-1.5">
              Giá mỗi đêm (VNĐ) *
            </label>
            <input
              type="number"
              min={100000}
              step={10000}
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-bold text-[#2853AF] focus:border-[#2853AF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#666D80] mb-1.5">
              Sức chứa tối đa (khách) *
            </label>
            <input
              type="number"
              min={1}
              max={12}
              required
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#666D80] mb-1.5">
              Diện tích (m²)
            </label>
            <input
              type="number"
              min={10}
              max={300}
              value={sizeM2}
              onChange={(e) => setSizeM2(e.target.value)}
              className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#666D80] mb-1.5">
              Loại giường
            </label>
            <input
              type="text"
              value={bedType}
              onChange={(e) => setBedType(e.target.value)}
              placeholder="1 giường đôi lớn (King)"
              className="w-full rounded-xl border border-[#DFE1E6] px-3.5 py-2.5 text-sm font-medium focus:border-[#2853AF] focus:outline-none"
            />
          </div>
        </div>

        <PhotoUploader
          collection="rooms"
          recordId={editing?.id}
          existingPhotos={editing?.photos || []}
          removedPhotos={removedPhotos}
          newFiles={newPhotos}
          externalImages={externalImages}
          label="Ảnh hạng phòng"
          helperText="Tải tối đa 8 ảnh thực tế của phòng này (JPG, PNG, WebP · ≤10MB/ảnh). Sẽ hiển thị ngay trong carousel Chi tiết phòng trên app Mobile."
          onChangeNewFiles={setNewPhotos}
          onToggleRemoveExisting={toggleRemoveExistingPhoto}
          onChangeExternalImages={setExternalImages}
        />

        <div className="rounded-2xl border border-[#ECEFF3] bg-[#F8FAFD] p-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="h-4 w-4 text-[#2853AF]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2853AF]">
              Tiện nghi trong phòng
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {roomAmenities.map((item) => {
              const checked = selectedAmenities.includes(item.name);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleAmenity(item.name)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    checked
                      ? 'border-[#2853AF] bg-[#2853AF] text-white'
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
            placeholder="Thêm tiện nghi riêng cho phòng (VD: Smart TV 55 inch, Mini bar)..."
            className="mt-3 w-full rounded-xl border border-[#DFE1E6] bg-white px-3 py-2 text-xs focus:border-[#2853AF] focus:outline-none"
          />
        </div>

        <label className="flex items-center justify-between rounded-xl border border-[#ECEFF3] px-4 py-3 cursor-pointer">
          <div>
            <p className="text-sm font-bold text-[#1A1B25]">Mở nhận đặt phòng</p>
            <p className="text-xs text-[#666D80]">
              Tắt khi phòng đang bảo trì hoặc tạm ngưng kinh doanh
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
            {busy ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : 'Thêm phòng'}
          </button>
        </div>
      </form>
    </ModalDrawer>
  );
}

