export function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

const baseControlClassName =
  "block w-full rounded-xl border bg-white/95 px-3 py-2 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)] outline-none transition duration-150 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500";

const normalControlStateClassName =
  "border-slate-300/90 focus:border-slate-400 focus:ring-2 focus:ring-slate-200/80 dark:border-slate-700/90 dark:focus:border-slate-500 dark:focus:ring-slate-700/70";

const errorControlStateClassName =
  "border-rose-300/90 focus:border-rose-400 focus:ring-2 focus:ring-rose-200/80 dark:border-rose-500/70 dark:focus:border-rose-400 dark:focus:ring-rose-500/30";

export function getFormControlClassName({
  error,
  className,
}: {
  error?: boolean;
  className?: string;
}): string {
  return mergeClassNames(
    baseControlClassName,
    error ? errorControlStateClassName : normalControlStateClassName,
    className,
  );
}
