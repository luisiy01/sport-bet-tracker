import { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
}

export function KpiCard({ title, value, subtitle, icon, trend }: KpiCardProps) {
  const trendColor =
    trend === 'positive'
      ? 'text-emerald-500'
      : trend === 'negative'
      ? 'text-rose-500'
      : 'text-zinc-400';

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-400">{title}</span>
        <div className="rounded-lg bg-zinc-800/80 p-2 text-zinc-300">{icon}</div>
      </div>
      <div className="mt-3">
        <div className={`text-2xl font-bold tracking-tight ${trendColor}`}>{value}</div>
        {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
      </div>
    </div>
  );
}