import { NavLink } from "react-router-dom";
import { appNavigation } from "../../app/router/routes";
import { userHasAnyRole } from "../../auth/role-utils";
import { useAuth } from "../../auth/useAuth";

const baseLinkClass =
  "group block rounded-xl px-3.5 py-2.5 text-sm font-medium transition";

export function Sidebar() {
  const { user } = useAuth();

  const visibleNavigation = appNavigation.filter((item) =>
    userHasAnyRole(user, item.roles),
  );

  return (
    <aside className="w-full border-b border-slate-200/80 bg-white/72 backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-slate-950/70 md:w-72 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200/80 px-5 py-5 dark:border-slate-800/80">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            SIFIPRO
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Loyalty Admin
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Multi-tenant workspace
          </p>
        </div>

        <nav className="px-3 py-4">
          <ul className="space-y-1">
            {visibleNavigation.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive
                      ? `${baseLinkClass} border border-slate-300/80 bg-slate-900 text-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-100 dark:text-slate-900`
                      : `${baseLinkClass} border border-transparent text-slate-600 hover:border-slate-200 hover:bg-white/90 hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-900/80 dark:hover:text-slate-100`
                  }
                >
                  <span className="flex items-center justify-between gap-2">
                    {item.label}
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 transition group-hover:bg-slate-500 dark:bg-slate-700 dark:group-hover:bg-slate-500" />
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto hidden border-t border-slate-200/80 px-5 py-4 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400 md:block">
          Built for elegant operational clarity.
        </div>
      </div>
    </aside>
  );
}
