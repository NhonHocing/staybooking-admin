import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: 'royal' | 'emerald' | 'amber' | 'rose';
}

const accentStyles = {
  royal: {
    iconBg: 'bg-[#E8F2FF] text-[#2853AF]',
    ring: 'border-[#DCE8FD]',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-700',
    ring: 'border-emerald-100',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-700',
    ring: 'border-amber-100',
  },
  rose: {
    iconBg: 'bg-rose-50 text-rose-700',
    ring: 'border-rose-100',
  },
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'royal',
}: StatCardProps) {
  const style = accentStyles[accent];
  return (
    <div
      className={`rounded-2xl bg-white border ${style.ring} p-5 shadow-[0_6px_24px_rgba(23,50,116,0.04)] flex items-start justify-between gap-4`}
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#666D80]">
          {label}
        </p>
        <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#1A1B25] truncate">
          {value}
        </p>
        {hint && (
          <p className="mt-1.5 text-xs font-medium text-[#666D80]">{hint}</p>
        )}
      </div>
      <div
        className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${style.iconBg}`}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

