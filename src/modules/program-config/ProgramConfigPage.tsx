import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { InlineAlert } from "../../components/ui/InlineAlert";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { extractErrorMessage } from "../../lib/error-utils";
import { useProgram } from "./ProgramContext";
import {
  activateProgramConfig,
  createProgramConfig,
  deactivateProgramConfig,
  getProgramConfigs,
  updateProgramConfig,
} from "./program-config.service";
import type {
  CreateProgramConfigRequest,
  ProgramConfigResponse,
  UpdateProgramConfigRequest,
} from "./program-config.types";
import { ProgramFormModal } from "./components/ProgramFormModal";
import { ProgramsTable } from "./components/ProgramsTable";

type FeedbackState = {
  kind: "success" | "error";
  message: string;
} | null;

type ProgramFormMode = "create" | "edit";

function ProgramConfigLoadingState() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-lg max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="h-24 animate-pulse rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/70" />
      <div className="h-96 animate-pulse rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/70" />
    </section>
  );
}

type ProgramConfigErrorStateProps = {
  message: string;
  onRetry: () => void;
};

function ProgramConfigErrorState({
  message,
  onRetry,
}: ProgramConfigErrorStateProps) {
  return (
    <SurfaceCard className="p-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Failed to load programs
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

function getToggleStatusErrorMessage(
  error: unknown,
  wasActive: boolean,
): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 404 || status === 405) {
      return wasActive
        ? "Deactivate endpoint is not available in this backend deployment."
        : "Activate endpoint is not available in this backend deployment.";
    }
  }

  const actionLabel = wasActive ? "deactivate" : "activate";
  return `Could not ${actionLabel} program. ${extractErrorMessage(error)}`;
}

export function ProgramConfigPage() {
  const { reloadPrograms } = useProgram();

  const [programs, setPrograms] = useState<ProgramConfigResponse[]>([]);
  const [formMode, setFormMode] = useState<ProgramFormMode>("create");
  const [editingProgram, setEditingProgram] =
    useState<ProgramConfigResponse | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusActionProgramId, setStatusActionProgramId] = useState<
    number | null
  >(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const loadPrograms = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
      setLoadError(null);
    }

    try {
      const response = await getProgramConfigs();
      setPrograms(response);

      if (!showLoader) {
        setLoadError(null);
      }
    } catch (error) {
      const message = extractErrorMessage(
        error,
        "Could not load tenant programs.",
      );

      if (showLoader) {
        setLoadError(message);
      } else {
        setFeedback({
          kind: "error",
          message: `Changes were saved but list refresh failed. ${message}`,
        });
      }
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  const activeProgramsCount = programs.filter(
    (program) => program.active,
  ).length;
  const inactiveProgramsCount = programs.length - activeProgramsCount;

  const openCreateForm = () => {
    setFormMode("create");
    setEditingProgram(null);
    setIsFormOpen(true);
  };

  const openEditForm = (program: ProgramConfigResponse) => {
    setFormMode("edit");
    setEditingProgram(program);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) {
      return;
    }

    setIsFormOpen(false);
    setEditingProgram(null);
  };

  const handleSubmitForm = async (
    payload: CreateProgramConfigRequest | UpdateProgramConfigRequest,
  ) => {
    setIsSaving(true);
    setFeedback(null);

    try {
      if (formMode === "create") {
        await createProgramConfig(payload as CreateProgramConfigRequest);
      } else {
        if (!editingProgram) {
          throw new Error("No program selected for editing.");
        }

        await updateProgramConfig(
          editingProgram.id,
          payload as UpdateProgramConfigRequest,
        );
      }

      await loadPrograms(false);
      await reloadPrograms();

      setIsFormOpen(false);
      setEditingProgram(null);
      setFeedback({
        kind: "success",
        message:
          formMode === "create"
            ? "Program created successfully."
            : "Program updated successfully.",
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message: `Could not save program. ${extractErrorMessage(error)}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (program: ProgramConfigResponse) => {
    setStatusActionProgramId(program.id);
    setFeedback(null);

    try {
      if (program.active) {
        await deactivateProgramConfig(program.id);
      } else {
        await activateProgramConfig(program.id);
      }

      await loadPrograms(false);
      await reloadPrograms();

      setFeedback({
        kind: "success",
        message: `${program.programName} was ${program.active ? "deactivated" : "activated"} successfully.`,
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message: getToggleStatusErrorMessage(error, program.active),
      });
    } finally {
      setStatusActionProgramId(null);
    }
  };

  if (isLoading) {
    return <ProgramConfigLoadingState />;
  }

  if (loadError) {
    return (
      <ProgramConfigErrorState
        message={loadError}
        onRetry={() => {
          void loadPrograms();
        }}
      />
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Programs
        </h1>
        <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          Manage all loyalty programs for the authenticated tenant. Create,
          edit, and toggle active status without leaving this workspace.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:border-slate-400 hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:border-slate-500 dark:hover:bg-white"
          >
            New Program
          </button>
          <button
            type="button"
            onClick={() => {
              void loadPrograms();
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>
      </header>

      {feedback ? (
        <InlineAlert tone={feedback.kind} message={feedback.message} />
      ) : null}

      <SurfaceCard className="p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Total Programs
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
              {programs.length}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Active
            </p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
              {activeProgramsCount}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Inactive
            </p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
              {inactiveProgramsCount}
            </p>
          </div>
        </div>
      </SurfaceCard>

      <ProgramsTable
        programs={programs}
        statusActionProgramId={statusActionProgramId}
        onEdit={openEditForm}
        onToggleStatus={(program) => {
          void handleToggleStatus(program);
        }}
      />

      <ProgramFormModal
        open={isFormOpen}
        mode={formMode}
        initialProgram={editingProgram}
        isSaving={isSaving}
        onClose={closeForm}
        onSubmit={handleSubmitForm}
      />
    </section>
  );
}
