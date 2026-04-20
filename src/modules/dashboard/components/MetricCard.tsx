import { SurfaceCard } from "../../../components/ui/SurfaceCard";

type MetricCardProps = {
  label: string;
  value: string;
};

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <SurfaceCard className="p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </SurfaceCard>
  );
}
