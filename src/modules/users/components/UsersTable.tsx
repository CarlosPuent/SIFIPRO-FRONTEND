import { SurfaceCard } from "../../../components/ui/SurfaceCard";
import type { UserResponse } from "../users.types";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";

type UsersTableProps = {
  users: UserResponse[];
  statusActionUserId: number | null;
  passwordActionUserId: number | null;
  onEdit: (id: number) => void;
  onToggleStatus: (user: UserResponse) => void;
  onChangePassword: (user: UserResponse) => void;
};

function getFullName(user: UserResponse): string {
  return `${user.firstName} ${user.lastName}`;
}

export function UsersTable({
  users,
  statusActionUserId,
  passwordActionUserId,
  onEdit,
  onToggleStatus,
  onChangePassword,
}: UsersTableProps) {
  return (
    <SurfaceCard className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800/80">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
            Internal Users
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Tenant admin and staff accounts.
          </p>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Total: {users.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80 text-sm dark:divide-slate-800/80">
            {users.map((user) => {
              const isStatusActionLoading = statusActionUserId === user.id;
              const isPasswordActionLoading = passwordActionUserId === user.id;

              return (
                <tr key={user.id}>
                  <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100">
                    {getFullName(user)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                    {user.email}
                  </td>
                  <td className="px-5 py-3.5">
                    <UserRoleBadge role={user.role} />
                  </td>
                  <td className="px-5 py-3.5">
                    <UserStatusBadge active={user.active} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(user.id)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleStatus(user)}
                        disabled={isStatusActionLoading}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                      >
                        {isStatusActionLoading
                          ? "Saving..."
                          : user.active
                            ? "Deactivate"
                            : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => onChangePassword(user)}
                        disabled={isPasswordActionLoading}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                      >
                        {isPasswordActionLoading
                          ? "Saving..."
                          : "Change Password"}
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
