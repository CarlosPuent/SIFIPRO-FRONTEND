import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { InlineAlert } from "../../components/ui/InlineAlert";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { extractErrorMessage } from "../../lib/error-utils";
import { PasswordUpdateModal } from "./components/PasswordUpdateModal";
import { UserFormModal } from "./components/UserFormModal";
import { UsersTable } from "./components/UsersTable";
import {
  activateUser,
  createUser,
  deactivateUser,
  getUserById,
  getUsers,
  updateUser,
  updateUserPassword,
} from "./users.service";
import type {
  CreateUserRequest,
  UpdateUserPasswordRequest,
  UpdateUserRequest,
  UserResponse,
} from "./users.types";

type FeedbackState = {
  kind: "success" | "error";
  message: string;
} | null;

type ModalMode = "create" | "edit";

function UsersLoadingState() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-lg max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="h-16 animate-pulse rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/70" />
      <div className="h-72 animate-pulse rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/70" />
    </section>
  );
}

type UsersErrorStateProps = {
  message: string;
  onRetry: () => void;
};

function UsersErrorState({ message, onRetry }: UsersErrorStateProps) {
  return (
    <SurfaceCard className="p-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Failed to load users
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:border-slate-400 hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:border-slate-500 dark:hover:bg-white"
      >
        Retry
      </button>
    </SurfaceCard>
  );
}

function UsersEmptyState() {
  return (
    <SurfaceCard className="p-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        No internal users yet
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Create your first user account to delegate admin and staff operations.
      </p>
    </SurfaceCard>
  );
}

export function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isLoadingModalData, setIsLoadingModalData] = useState(false);

  const [isSavingModal, setIsSavingModal] = useState(false);
  const [statusActionUserId, setStatusActionUserId] = useState<number | null>(
    null,
  );

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] =
    useState<UserResponse | null>(null);
  const [passwordActionUserId, setPasswordActionUserId] = useState<
    number | null
  >(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      setLoadError(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleOpenCreate = () => {
    setFeedback(null);
    setModalMode("create");
    setSelectedUserId(null);
    setSelectedUser(null);
    setIsLoadingModalData(false);
    setModalOpen(true);
  };

  const handleOpenEdit = async (userId: number) => {
    setFeedback(null);
    setModalMode("edit");
    setSelectedUserId(userId);
    setSelectedUser(null);
    setIsLoadingModalData(true);
    setModalOpen(true);

    try {
      const user = await getUserById(userId);
      setSelectedUser(user);
    } catch (error) {
      setModalOpen(false);
      setFeedback({
        kind: "error",
        message: `Could not load user details. ${extractErrorMessage(error)}`,
      });
    } finally {
      setIsLoadingModalData(false);
    }
  };

  const handleCloseModal = () => {
    if (isSavingModal) {
      return;
    }

    setModalOpen(false);
  };

  const handleSubmitUser = async (
    payload: CreateUserRequest | UpdateUserRequest,
  ) => {
    setIsSavingModal(true);

    try {
      if (modalMode === "create") {
        await createUser(payload as CreateUserRequest);
        setFeedback({
          kind: "success",
          message: "User created successfully.",
        });
      } else {
        if (!selectedUserId) {
          throw new Error("User identifier is missing.");
        }

        await updateUser(selectedUserId, payload as UpdateUserRequest);
        setFeedback({
          kind: "success",
          message: "User updated successfully.",
        });
      }

      setModalOpen(false);
      await loadUsers();
    } catch (error) {
      setFeedback({
        kind: "error",
        message: `Could not save user. ${extractErrorMessage(error)}`,
      });
    } finally {
      setIsSavingModal(false);
    }
  };

  const handleToggleUserStatus = async (user: UserResponse) => {
    setStatusActionUserId(user.id);
    setFeedback(null);

    try {
      if (user.active) {
        await deactivateUser(user.id);
        setFeedback({
          kind: "success",
          message: "User deactivated successfully.",
        });
      } else {
        await activateUser(user.id);
        setFeedback({
          kind: "success",
          message: "User activated successfully.",
        });
      }

      await loadUsers();
    } catch (error) {
      setFeedback({
        kind: "error",
        message: `Could not update user status. ${extractErrorMessage(error)}`,
      });
    } finally {
      setStatusActionUserId(null);
    }
  };

  const handleOpenPasswordChange = (user: UserResponse) => {
    setFeedback(null);
    setPasswordTargetUser(user);
    setPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    if (passwordActionUserId) {
      return;
    }

    setPasswordModalOpen(false);
    setPasswordTargetUser(null);
  };

  const handleSubmitPassword = async (payload: UpdateUserPasswordRequest) => {
    if (!passwordTargetUser) {
      return;
    }

    setPasswordActionUserId(passwordTargetUser.id);

    try {
      await updateUserPassword(passwordTargetUser.id, payload);

      setFeedback({
        kind: "success",
        message: "Password updated successfully.",
      });

      setPasswordModalOpen(false);
      setPasswordTargetUser(null);
      await loadUsers();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setFeedback({
          kind: "error",
          message:
            "Password update endpoint is not available in this backend environment.",
        });
      } else {
        setFeedback({
          kind: "error",
          message: `Could not update password. ${extractErrorMessage(error)}`,
        });
      }
    } finally {
      setPasswordActionUserId(null);
    }
  };

  if (isLoading) {
    return <UsersLoadingState />;
  }

  if (loadError) {
    return <UsersErrorState message={loadError} onRetry={loadUsers} />;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Users
        </h1>
        <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          Admin-only management of internal user accounts and access roles.
        </p>
      </header>

      {feedback ? (
        <InlineAlert tone={feedback.kind} message={feedback.message} />
      ) : null}

      <SurfaceCard className="flex items-center justify-between p-4 sm:p-5">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
            User Management
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Create, edit, activate, and deactivate internal users.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:border-slate-400 hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:border-slate-500 dark:hover:bg-white"
        >
          New User
        </button>
      </SurfaceCard>

      {users.length === 0 ? (
        <UsersEmptyState />
      ) : (
        <UsersTable
          users={users}
          statusActionUserId={statusActionUserId}
          passwordActionUserId={passwordActionUserId}
          onEdit={handleOpenEdit}
          onToggleStatus={handleToggleUserStatus}
          onChangePassword={handleOpenPasswordChange}
        />
      )}

      <UserFormModal
        open={modalOpen}
        mode={modalMode}
        initialUser={selectedUser}
        isSaving={isSavingModal}
        isLoadingInitialData={isLoadingModalData}
        onClose={handleCloseModal}
        onSubmit={handleSubmitUser}
      />

      {passwordModalOpen && passwordTargetUser ? (
        <PasswordUpdateModal
          open={passwordModalOpen}
          user={passwordTargetUser}
          isSaving={Boolean(passwordActionUserId)}
          onClose={handleClosePasswordModal}
          onSubmit={handleSubmitPassword}
        />
      ) : null}
    </section>
  );
}
