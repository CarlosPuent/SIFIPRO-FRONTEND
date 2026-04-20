import { Link } from "react-router-dom";
import type { AuthRole } from "../../../auth/auth.types";
import { SurfaceCard } from "../../../components/ui/SurfaceCard";

type DashboardQuickActionsProps = {
  role: AuthRole;
  hasProgramConfigRoute: boolean;
};

type QuickAction = {
  label: string;
  description: string;
  path: string;
};

function buildActions(
  role: AuthRole,
  hasProgramConfigRoute: boolean,
): QuickAction[] {
  if (role === "STAFF") {
    return [
      {
        label: "New Customer",
        description: "Register a customer profile for daily operations.",
        path: "/customers",
      },
      {
        label: "New Transaction",
        description: "Record purchase activity and points issuance.",
        path: "/transactions",
      },
      {
        label: "New Redemption",
        description: "Process reward redemption requests quickly.",
        path: "/redemptions",
      },
    ];
  }

  const adminActions: QuickAction[] = [
    {
      label: "New Customer",
      description: "Create and manage customer profiles.",
      path: "/customers",
    },
    {
      label: "New Reward",
      description: "Add or revise redeemable reward options.",
      path: "/rewards",
    },
    {
      label: "New Transaction",
      description: "Record and supervise operational transactions.",
      path: "/transactions",
    },
    {
      label: "New Redemption",
      description: "Track reward redemption activity.",
      path: "/redemptions",
    },
    {
      label: "Users",
      description: "Manage internal admin and staff accounts.",
      path: "/users",
    },
  ];

  if (hasProgramConfigRoute) {
    adminActions.push({
      label: "Program Settings",
      description: "Adjust loyalty program settings and controls.",
      path: "/program-config",
    });
  }

  return adminActions;
}

export function DashboardQuickActions({
  role,
  hasProgramConfigRoute,
}: DashboardQuickActionsProps) {
  const actions = buildActions(role, hasProgramConfigRoute);

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <SurfaceCard key={action.label} className="p-0">
            <Link
              to={action.path}
              className="block rounded-2xl px-4 py-4 transition hover:bg-slate-50/80 dark:hover:bg-slate-900/75"
            >
              <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {action.label}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {action.description}
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Open
              </p>
            </Link>
          </SurfaceCard>
        ))}
      </div>
    </section>
  );
}
