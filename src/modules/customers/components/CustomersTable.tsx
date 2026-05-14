import { SurfaceCard } from "../../../components/ui/SurfaceCard";
import { fallbackText, formatPoints } from "../../../lib/formatters";
import type { CustomerResponse } from "../customers.types";
import { CustomerStatusBadge } from "./CustomerStatusBadge";

type CustomersTableProps = {
  customers: CustomerResponse[];
  actionCustomerId: number | null;
  onEdit: (id: number) => void;
  onToggleStatus: (customer: CustomerResponse) => void;
};

function getFullName(customer: CustomerResponse): string {
  return `${customer.firstName} ${customer.lastName}`;
}

export function CustomersTable({
  customers,
  actionCustomerId,
  onEdit,
  onToggleStatus,
}: CustomersTableProps) {
  return (
    <SurfaceCard className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800/80">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
            Customers
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Tenant customer records and current balance visibility.
          </p>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Total: {customers.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Points Balance</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 text-sm dark:divide-slate-800/80">
            {customers.map((customer) => {
              const isActionLoading = actionCustomerId === customer.id;

              return (
                <tr key={customer.id}>
                  <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100">
                    {getFullName(customer)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                    {customer.email}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                    {fallbackText(customer.phone)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-200">
                    {formatPoints(customer.pointsBalance)}
                  </td>
                  <td className="px-5 py-3.5">
                    <CustomerStatusBadge active={customer.active} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(customer.id)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(customer)}
                        disabled={isActionLoading}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                      >
                        {isActionLoading
                          ? "Saving..."
                          : customer.active
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}
