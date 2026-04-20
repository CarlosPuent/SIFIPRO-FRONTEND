import type { Theme } from "../../lib/theme";

type ThemeToggleProps = {
  theme: Theme;
  onToggle: () => void;
};

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M12 4V2m0 20v-2m8-8h2M2 12h2m11.314 6.314 1.414 1.414M5.272 5.272 6.686 6.686m10.628 0 1.414-1.414M5.272 18.728l1.414-1.414M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3c-.08.5-.12 1.02-.12 1.54A8.25 8.25 0 0 0 19.46 12c.52 0 1.04-.04 1.54-.12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
      aria-label="Toggle application theme"
      title="Toggle theme"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span>{isDark ? "Light" : "Dark"} mode</span>
    </button>
  );
}
