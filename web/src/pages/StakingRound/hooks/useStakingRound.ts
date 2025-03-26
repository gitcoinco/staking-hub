import { useState, useCallback, useMemo } from "react";
import { ProjectData } from "./useProjectsData";

export const useStakingRoundState = () => {
  const [applicationsToStakeAmount, setApplicationsToStakeAmount] = useState<
    Record<string, number>
  >({});
  const [amountToApplyToAll, setAmountToApplyToAll] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState("totalStaked");

  const totalStaked = useMemo(() => {
    return Object.values(applicationsToStakeAmount).reduce((sum, amount) => sum + amount, 0);
  }, [applicationsToStakeAmount]);

  const handleStakeChange = useCallback((applicationId: string, amount: number) => {
    setApplicationsToStakeAmount((prev) => ({
      ...prev,
      [applicationId]: amount,
    }));
  }, []);

  const handleApplyToAll = useCallback(
    (projects: ProjectData[], excludeId?: string) => {
      if (amountToApplyToAll === null) return;

      setApplicationsToStakeAmount((prev) => {
        const newStakes = { ...prev };

        // Preserve the existing stake for the excluded project
        const excludedProjectStake = excludeId ? prev[excludeId] : undefined;

        // Apply the new amount to all other projects
        projects.forEach((project) => {
          if (project.id !== excludeId) {
            newStakes[project.id] = amountToApplyToAll;
          }
        });

        // Restore the excluded project's stake if it exists
        if (excludeId && excludedProjectStake !== undefined) {
          newStakes[excludeId] = excludedProjectStake;
        }

        return newStakes;
      });
    },
    [amountToApplyToAll],
  );

  const handleClearAll = () => {
    setApplicationsToStakeAmount({});
    setAmountToApplyToAll(null);
  };

  const handleSortChange = useCallback((value: string) => {
    setSortOption(value);
  }, []);

  return {
    applicationsToStakeAmount,
    amountToApplyToAll,
    sortOption,
    totalStaked,
    setAmountToApplyToAll,
    handleStakeChange,
    handleApplyToAll,
    handleSortChange,
    handleClearAll,
  };
};
