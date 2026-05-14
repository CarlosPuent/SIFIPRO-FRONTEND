import { SurfaceCard } from "../../../components/ui/SurfaceCard";

type MetricCardProps = {
  label: string;
  value: string;
};

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <SurfaceCard className="relative overflow-hidden p-4 sm:p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent dark:via-slate-700/80" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-50 sm:text-[2rem]">
        {value}
      </p>
    </SurfaceCard>
  );
}
