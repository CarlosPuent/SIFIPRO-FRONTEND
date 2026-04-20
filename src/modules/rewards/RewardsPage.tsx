import { useCallback, useEffect, useState } from "react";
import { InlineAlert } from "../../components/ui/InlineAlert";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { extractErrorMessage } from "../../lib/error-utils";
import { useProgram } from "../program-config/ProgramContext";
import { RewardFormModal } from "./components/RewardFormModal";
import { RewardsTable } from "./components/RewardsTable";
import {
  activateReward,
  createReward,
  deactivateReward,
  getRewardsByProgram,
  updateReward,
} from "./rewards.service";
import type {
  CreateRewardRequest,
  RewardFormSubmitPayload,
  RewardResponse,
} from "./rewards.types";

type FeedbackState = {
  kind: "success" | "error";
  message: string;
} | null;

type ModalMode = "create" | "edit";

function RewardsLoadingState() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-lg max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="h-16 animate-pulse rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/70" />
      <div className="h-72 animate-pulse rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/70" />
    </section>
  );
}

type RewardsProgramSelectionStateProps = {
  isLoadingPrograms: boolean;
  programsError: string | null;
};

function RewardsProgramSelectionState({
  isLoadingPrograms,
  programsError,
}: RewardsProgramSelectionStateProps) {
  return (
    <SurfaceCard className="p-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {isLoadingPrograms ? "Loading programs" : "No program selected"}
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {isLoadingPrograms
          ? "Please wait while we resolve available programs for this tenant."
          : "Select a program from the header to view and manage rewards."}
      </p>
      {programsError ? (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
          {programsError}
        </p>
      ) : null}
    </SurfaceCard>
  );
}

type RewardsErrorStateProps = {
  message: string;
  onRetry: () => void;
};

function RewardsErrorState({ message, onRetry }: RewardsErrorStateProps) {
  return (
    <SurfaceCard className="p-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Failed to load rewards
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

function RewardsEmptyState() {
  return (
    <SurfaceCard className="p-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        No rewards yet
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Create your first reward to start enabling redemptions.
      </p>
    </SurfaceCard>
  );
}

export function RewardsPage() {
  const { currentProgram, isLoadingPrograms, programsError } = useProgram();
  const currentProgramId = currentProgram?.id ?? null;

  const [rewards, setRewards] = useState<RewardResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedReward, setSelectedReward] = useState<RewardResponse | null>(
    null,
  );

  const [isSavingModal, setIsSavingModal] = useState(false);
  const [actionRewardId, setActionRewardId] = useState<number | null>(null);

  const loadRewards = useCallback(async (programConfigId: number) => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await getRewardsByProgram(programConfigId);
      setRewards(data);
    } catch (error) {
      setLoadError(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentProgramId) {
      setRewards([]);
      setLoadError(null);
      setIsLoading(false);
      setModalOpen(false);
      return;
    }

    void loadRewards(currentProgramId);
  }, [currentProgramId, loadRewards]);

  const handleOpenCreate = () => {
    if (!currentProgramId) {
      setFeedback({
        kind: "error",
        message: "Select a program before creating rewards.",
      });
      return;
    }

    setFeedback(null);
    setModalMode("create");
    setSelectedReward(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (reward: RewardResponse) => {
    setFeedback(null);
    setModalMode("edit");
    setSelectedReward(reward);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSavingModal) {
      return;
    }

    setModalOpen(false);
  };

  const handleSubmitReward = async (payload: RewardFormSubmitPayload) => {
    if (!currentProgramId) {
      setFeedback({
        kind: "error",
        message: "Select a program before saving rewards.",
      });
      return;
    }

    setIsSavingModal(true);

    try {
      const payloadWithProgram: CreateRewardRequest = {
        ...payload,
        programConfigId: currentProgramId,
      };

      if (modalMode === "create") {
        await createReward(payloadWithProgram);
        setFeedback({
          kind: "success",
          message: "Reward created successfully.",
        });
      } else {
        if (!selectedReward) {
          throw new Error("Reward identifier is missing.");
        }

        await updateReward(selectedReward.id, payloadWithProgram);
        setFeedback({
          kind: "success",
          message: "Reward updated successfully.",
        });
      }

      setModalOpen(false);
      await loadRewards(currentProgramId);
    } catch (error) {
      setFeedback({
        kind: "error",
        message: `Could not save reward. ${extractErrorMessage(error)}`,
      });
    } finally {
      setIsSavingModal(false);
    }
  };

  const handleToggleRewardStatus = async (reward: RewardResponse) => {
    if (!currentProgramId) {
      return;
    }

    setActionRewardId(reward.id);
    setFeedback(null);

    try {
      if (reward.active) {
        await deactivateReward(reward.id);
        setFeedback({
          kind: "success",
          message: "Reward deactivated successfully.",
        });
      } else {
        await activateReward(reward.id);
        setFeedback({
          kind: "success",
          message: "Reward activated successfully.",
        });
      }

      await loadRewards(currentProgramId);
    } catch (error) {
      setFeedback({
        kind: "error",
        message: `Could not update reward status. ${extractErrorMessage(error)}`,
      });
    } finally {
      setActionRewardId(null);
    }
  };

  if (isLoading) {
    return <RewardsLoadingState />;
  }

  if (!currentProgram) {
    return (
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Rewards
          </h1>
          <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
            Rewards are managed per program. Select a program from the header to
            continue.
          </p>
        </header>

        <RewardsProgramSelectionState
          isLoadingPrograms={isLoadingPrograms}
          programsError={programsError}
        />
      </section>
    );
  }

  if (loadError) {
    return (
      <RewardsErrorState
        message={loadError}
        onRetry={() => {
          void loadRewards(currentProgram.id);
        }}
      />
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Rewards
        </h1>
        <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          Manage redemption rewards, point requirements, and stock availability
          for the selected program.
        </p>
      </header>

      {feedback ? (
        <InlineAlert tone={feedback.kind} message={feedback.message} />
      ) : null}

      <SurfaceCard className="flex items-center justify-between p-4 sm:p-5">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
            Reward Management
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Program: {currentProgram.programName} (ID: {currentProgram.id})
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:border-slate-400 hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:border-slate-500 dark:hover:bg-white"
        >
          New Reward
        </button>
      </SurfaceCard>

      {rewards.length === 0 ? (
        <RewardsEmptyState />
      ) : (
        <RewardsTable
          rewards={rewards}
          actionRewardId={actionRewardId}
          onEdit={handleOpenEdit}
          onToggleStatus={handleToggleRewardStatus}
        />
      )}

      <RewardFormModal
        open={modalOpen}
        mode={modalMode}
        initialReward={selectedReward}
        isSaving={isSavingModal}
        isLoadingInitialData={false}
        onClose={handleCloseModal}
        onSubmit={handleSubmitReward}
      />
    </section>
  );
}
