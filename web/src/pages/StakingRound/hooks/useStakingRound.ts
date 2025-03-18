import { useState, useCallback } from "react";
import { ProjectData } from "./useProjectsData";

export const useStakingRoundState = (userGTCBalance: string) => {
  const [applicationsToStakeAmount, setApplicationsToStakeAmount] = useState<
    Record<string, number>
  >({});
  const [amountToApplyToAll, setAmountToApplyToAll] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<string>("totalStaked");

  const totalStaked = Object.values(applicationsToStakeAmount).reduce(
    (sum, amount) => sum + amount,
    0,
  );

  const handleStakeChange = useCallback((projectId: string, amount: number) => {
    setApplicationsToStakeAmount((prev) => ({
      ...prev,
      [projectId]: Math.max(0, amount),
    }));
  }, []);

  const handleApplyToAll = useCallback(
    (projects: ProjectData[]) => {
      if (amountToApplyToAll === null) return;

      const maxPerProject = Number(userGTCBalance) / projects.length;
      const clampedValue = Math.min(amountToApplyToAll, maxPerProject);

      const newStakes = projects.reduce(
        (acc, project) => ({
          ...acc,
          [project.id]: clampedValue,
        }),
        {},
      );

      setApplicationsToStakeAmount(newStakes);
    },
    [amountToApplyToAll, userGTCBalance],
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
