import { useLocation } from "react-router-dom";
import { appNavigation } from "../../app/router/routes";
import { isAdmin, isStaff } from "../../auth/role-utils";
import { useAuth } from "../../auth/useAuth";
import { useProgram } from "../../modules/program-config/ProgramContext";
import type { Theme } from "../../lib/theme";
import { ThemeToggle } from "../ui/ThemeToggle";

type AppHeaderProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

export function AppHeader({ theme, onToggleTheme }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const {
    programs,
    currentProgram,
    currentProgramId,
    setCurrentProgramById,
    isLoadingPrograms,
    programsError,
  } = useProgram();
  const location = useLocation();
  const activeItem = appNavigation.find(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`),
  );

  const userDisplayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Authenticated User";

  const roleLabel = isAdmin(user) ? "ADMIN" : isStaff(user) ? "STAFF" : "-";
  const tenantName = user?.tenant.name ?? "-";
  const hasPrograms = programs.length > 0;
  const selectorValue =
    currentProgramId !== null && hasPrograms ? String(currentProgramId) : "";

  const programStatusLabel = isLoadingPrograms
    ? "Loading programs..."
    : hasPrograms
      ? currentProgram
        ? `Current Program: ${currentProgram.programName}`
        : "Select a program"
      : "No programs available";

  const handleProgramChange = (value: string) => {
    const nextProgramId = Number(value);

    if (Number.isInteger(nextProgramId) && nextProgramId > 0) {
      setCurrentProgramById(nextProgramId);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-3 backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-slate-950/65 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              SIFIPRO Admin
            </p>
            <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-xl">
              {activeItem?.label ?? "SIFIPRO"}
            </h1>
            {activeItem?.description ? (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                {activeItem.description}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-3 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/70 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                {userDisplayName.charAt(0).toUpperCase()}
              </span>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  {userDisplayName}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {roleLabel}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {tenantName}
                </p>
              </div>
            </div>

            <ThemeToggle theme={theme} onToggle={onToggleTheme} />

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center rounded-xl border border-slate-300 bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:border-slate-400 hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:border-slate-500 dark:hover:bg-white"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
          <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/70 sm:hidden">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {userDisplayName}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {roleLabel}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {tenantName}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/70 sm:justify-self-end">
            <label
              htmlFor="current-program-selector"
              className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
            >
              Program
            </label>
            <select
              id="current-program-selector"
              value={selectorValue}
              disabled={isLoadingPrograms || !hasPrograms}
              onChange={(event) => {
                handleProgramChange(event.target.value);
              }}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
            >
              {isLoadingPrograms ? (
                <option value="">Loading programs...</option>
              ) : null}
              {!isLoadingPrograms && !hasPrograms ? (
                <option value="">No programs available</option>
              ) : null}
              {!isLoadingPrograms
                ? programs.map((program) => (
                    <option key={program.id} value={String(program.id)}>
                      {program.programName}
                    </option>
                  ))
                : null}
            </select>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {programStatusLabel}
            </p>
            {programsError ? (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                {programsError}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
