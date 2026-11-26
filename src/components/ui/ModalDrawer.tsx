import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalDrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidthClass?: string;
}

export function ModalDrawer({
  open,
  title,
  subtitle,
  onClose,
  children,
  maxWidthClass = 'max-w-xl',
}: ModalDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex h-full w-full ${maxWidthClass} flex-col bg-white shadow-2xl border-l border-[#ECEFF3]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#ECEFF3] px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-[#1A1B25]">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-xs font-medium text-[#666D80]">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[#666D80] hover:bg-[#F6F8FA] hover:text-[#1A1B25] transition-colors"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

