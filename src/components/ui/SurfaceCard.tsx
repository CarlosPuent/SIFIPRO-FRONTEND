import type { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

export function SurfaceCard({ children, className }: SurfaceCardProps) {
  const defaultClasses =
    "rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur-sm transition-colors dark:border-slate-800/80 dark:bg-slate-900/75";

  return (
    <section className={`${defaultClasses} ${className ?? ""}`.trim()}>
      {children}
    </section>
  );
}
