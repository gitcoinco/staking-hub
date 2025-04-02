import { useState, useCallback, useMemo } from "react";
import { ProjectData } from "./useProjectsData";

interface RoundState {
  applicationsToStakeAmount: Record<string, number>;
  amountToApplyToAll: number | null;
  sortOption: string;
}

const DEFAULT_ROUND_STATE: RoundState = {
  applicationsToStakeAmount: {},
  amountToApplyToAll: null,
  sortOption: "totalStaked",
};

export const useStakingRoundState = (roundId?: string) => {
  // Store state for all rounds
  const [roundStates, setRoundStates] = useState<Record<string, RoundState>>({});

  // Get or initialize state for current round
  const currentRoundState = roundId
    ? roundStates[roundId] || DEFAULT_ROUND_STATE
    : DEFAULT_ROUND_STATE;

  // Update state for current round
  const updateCurrentRoundState = useCallback(
    (updates: Partial<RoundState>) => {
      if (!roundId) return;

      setRoundStates((prev) => ({
        ...prev,
        [roundId]: {
          ...(prev[roundId] || DEFAULT_ROUND_STATE),
          ...updates,
        },
      }));
    },
    [roundId],
  );

  const totalStaked = useMemo(() => {
    return Object.values(currentRoundState.applicationsToStakeAmount).reduce(
      (sum, amount) => sum + amount,
      0,
    );
  }, [currentRoundState.applicationsToStakeAmount]);

  const handleStakeChange = useCallback(
    (applicationId: string, amount: number) => {
      updateCurrentRoundState({
        applicationsToStakeAmount: {
          ...currentRoundState.applicationsToStakeAmount,
          [applicationId]: amount,
        },
      });
    },
    [currentRoundState.applicationsToStakeAmount, updateCurrentRoundState],
  );

  const handleApplyToAll = useCallback(
    (projects: ProjectData[], excludeId?: string) => {
      if (currentRoundState.amountToApplyToAll === null) return;

      const newStakes = { ...currentRoundState.applicationsToStakeAmount };

      // Preserve the existing stake for the excluded project
      const excludedProjectStake = excludeId ? newStakes[excludeId] : undefined;

      // Apply the new amount to all other projects
      projects.forEach((project) => {
        if (project.id !== excludeId) {
          newStakes[project.id] = currentRoundState.amountToApplyToAll!;
        }
      });

      // Restore the excluded project's stake if it exists
      if (excludeId && excludedProjectStake !== undefined) {
        newStakes[excludeId] = excludedProjectStake;
      }

      updateCurrentRoundState({
        applicationsToStakeAmount: newStakes,
      });
    },
    [
      currentRoundState.amountToApplyToAll,
      currentRoundState.applicationsToStakeAmount,
      updateCurrentRoundState,
    ],
  );

  const handleClearAll = useCallback(() => {
    updateCurrentRoundState({
      applicationsToStakeAmount: {},
      amountToApplyToAll: null,
    });
  }, [updateCurrentRoundState]);

  const handleSortChange = useCallback(
    (value: string) => {
      updateCurrentRoundState({ sortOption: value });
    },
    [updateCurrentRoundState],
  );

  return {
    applicationsToStakeAmount: currentRoundState.applicationsToStakeAmount,
    amountToApplyToAll: currentRoundState.amountToApplyToAll,
    sortOption: currentRoundState.sortOption,
    totalStaked,
    setAmountToApplyToAll: (value: number | null) =>
      updateCurrentRoundState({ amountToApplyToAll: value }),
    handleStakeChange,
    handleApplyToAll,
    handleSortChange,
    handleClearAll,
  };
};
