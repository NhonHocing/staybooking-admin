import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus, Link2, RotateCcw, Trash2, UploadCloud } from 'lucide-react';
import { getRecordPhotoUrl } from '../../lib/pocketbase';

interface PhotoUploaderProps {
  collection: 'hotels' | 'rooms';
  recordId?: string;
  existingPhotos: string[];
  removedPhotos: string[];
  newFiles: File[];
  externalImages: string;
  maxFiles?: number;
  label?: string;
  helperText?: string;
  onChangeNewFiles: (files: File[]) => void;
  onToggleRemoveExisting: (filename: string) => void;
  onChangeExternalImages: (value: string) => void;
}

export function PhotoUploader({
  collection,
  recordId,
  existingPhotos,
  removedPhotos,
  newFiles,
  externalImages,
  maxFiles = 8,
  label = 'Thư viện hình ảnh',
  helperText = 'Tải tối đa 8 ảnh (JPG, PNG, WebP · ≤10MB/ảnh). Ảnh đầu tiên sẽ là ảnh bìa hiển thị trên ứng dụng Mobile.',
  onChangeNewFiles,
  onToggleRemoveExisting,
  onChangeExternalImages,
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const previews = useMemo(
    () =>
      newFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [newFiles],
  );

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const activeExistingCount = existingPhotos.filter(
    (name) => !removedPhotos.includes(name),
  ).length;
  const totalUploadedCount = activeExistingCount + newFiles.length;
  const remainingSlots = Math.max(0, maxFiles - totalUploadedCount);

  const externalUrls = useMemo(
    () =>
      externalImages
        .split(',')
        .map((u) => u.trim())
        .filter((u) => /^https?:\/\//i.test(u)),
    [externalImages],
  );

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (picked.length === 0) return;

    setLocalError(null);
    const valid: File[] = [];
    for (const file of picked) {
      if (!file.type.startsWith('image/')) {
        setLocalError(`Tệp "${file.name}" không phải định dạng hình ảnh hợp lệ.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setLocalError(`Ảnh "${file.name}" vượt quá giới hạn 10MB.`);
        continue;
      }
      valid.push(file);
    }

    if (valid.length === 0) return;
    if (valid.length > remainingSlots) {
      setLocalError(
        `Chỉ có thể tải thêm tối đa ${remainingSlots} ảnh (tổng giới hạn ${maxFiles} ảnh).`,
      );
      onChangeNewFiles([...newFiles, ...valid.slice(0, remainingSlots)]);
      return;
    }

    onChangeNewFiles([...newFiles, ...valid]);
  };

  const handleRemoveNewFile = (idx: number) => {
    onChangeNewFiles(newFiles.filter((_, i) => i !== idx));
  };

  const handleAddExternalUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      setLocalError('Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://');
      return;
    }
    setLocalError(null);
    if (!externalUrls.includes(trimmed)) {
      onChangeExternalImages([...externalUrls, trimmed].join(', '));
    }
    setUrlInput('');
  };

  const handleRemoveExternalUrl = (target: string) => {
    onChangeExternalImages(externalUrls.filter((u) => u !== target).join(', '));
  };

  let coverAssigned = false;

  return (
    <div className="rounded-2xl border border-[#ECEFF3] bg-[#F8FAFD] p-4 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ImagePlus className="h-4 w-4 text-[#2853AF]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#2853AF]">
            {label}
          </span>
        </div>
        <span className="rounded-lg bg-white border border-[#DFE1E6] px-2.5 py-0.5 text-[11px] font-bold text-[#1A1B25]">
          {totalUploadedCount}/{maxFiles} ảnh tải lên
          {externalUrls.length > 0 ? ` · +${externalUrls.length} link ngoài` : ''}
        </span>
      </div>

      <p className="text-xs text-[#666D80]">{helperText}</p>

      {localError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          {localError}
        </div>
      )}

      {/* Upload drop/pick button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          disabled={remainingSlots === 0}
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-[#B9CEFA] bg-white px-4 py-3.5 text-xs font-bold text-[#2853AF] hover:bg-[#F2F7FF] hover:border-[#2853AF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <UploadCloud className="h-4 w-4" />
          <span>
            {remainingSlots > 0
              ? `Chọn ảnh từ máy tính (còn thêm được ${remainingSlots} ảnh)`
              : 'Đã đạt giới hạn 8 ảnh — hãy gỡ bớt ảnh cũ nếu muốn thay thế'}
          </span>
        </button>
      </div>

      {/* Photo grid: existing + newly picked + external URLs */}
      {(existingPhotos.length > 0 || previews.length > 0 || externalUrls.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Existing PocketBase photos */}
          {recordId &&
            existingPhotos.map((filename) => {
              const markedDelete = removedPhotos.includes(filename);
              const isCover = !markedDelete && !coverAssigned;
              if (isCover) coverAssigned = true;
              const thumbUrl = getRecordPhotoUrl(
                collection,
                recordId,
                filename,
                '240x180',
              );
              return (
                <div
                  key={filename}
                  className={`group relative overflow-hidden rounded-xl border bg-white ${
                    markedDelete
                      ? 'border-rose-300 opacity-55'
                      : 'border-[#DFE1E6]'
                  }`}
                >
                  <img
                    src={thumbUrl}
                    alt={filename}
                    className="h-24 w-full object-cover"
                  />
                  {isCover && (
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-[#2853AF]/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      Ảnh bìa
                    </span>
                  )}
                  {markedDelete && (
                    <span className="absolute inset-x-1.5 top-1.5 rounded-md bg-rose-600/95 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                      Sẽ xóa khi lưu
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggleRemoveExisting(filename)}
                    title={markedDelete ? 'Hoàn tác xóa' : 'Gỡ ảnh này'}
                    className={`absolute right-1.5 bottom-1.5 rounded-lg p-1.5 text-white shadow-sm transition-opacity cursor-pointer ${
                      markedDelete
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-black/65 hover:bg-rose-600'
                    }`}
                  >
                    {markedDelete ? (
                      <RotateCcw className="h-3.5 w-3.5" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              );
            })}

          {/* Newly selected local files */}
          {previews.map((item, idx) => {
            const isCover = !coverAssigned;
            if (isCover) coverAssigned = true;
            return (
              <div
                key={`${item.file.name}-${idx}`}
                className="relative overflow-hidden rounded-xl border-2 border-[#3B7CE8] bg-white"
              >
                <img
                  src={item.url}
                  alt={item.file.name}
                  className="h-24 w-full object-cover"
                />
                <span className="absolute left-1.5 top-1.5 rounded-md bg-emerald-600/95 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                  {isCover ? 'Ảnh bìa · Mới' : 'Ảnh mới'}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveNewFile(idx)}
                  title="Bỏ ảnh vừa chọn"
                  className="absolute right-1.5 bottom-1.5 rounded-lg bg-black/65 p-1.5 text-white hover:bg-rose-600 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}

          {/* External URL previews */}
          {externalUrls.map((url) => {
            const isCover = !coverAssigned;
            if (isCover) coverAssigned = true;
            return (
              <div
                key={url}
                className="relative overflow-hidden rounded-xl border border-[#DFE1E6] bg-white"
              >
                <img
                  src={url}
                  alt="Ảnh URL"
                  className="h-24 w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = '0.25';
                  }}
                />
                <span className="absolute left-1.5 top-1.5 rounded-md bg-slate-800/85 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {isCover ? 'Ảnh bìa · URL' : 'URL'}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveExternalUrl(url)}
                  title="Gỡ link ảnh"
                  className="absolute right-1.5 bottom-1.5 rounded-lg bg-black/65 p-1.5 text-white hover:bg-rose-600 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Optional external URL input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Link2 className="h-3.5 w-3.5 text-[#666D80] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddExternalUrl();
              }
            }}
            placeholder="Hoặc dán link ảnh online (https://...) rồi bấm Thêm link"
            className="w-full rounded-xl border border-[#DFE1E6] bg-white pl-8 pr-3 py-2 text-xs focus:border-[#2853AF] focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAddExternalUrl}
          className="rounded-xl border border-[#DFE1E6] bg-white px-3 py-2 text-xs font-bold text-[#2853AF] hover:bg-[#E8F2FF] whitespace-nowrap cursor-pointer"
        >
          + Thêm link
        </button>
      </div>
    </div>
  );
}
