import { useMemo } from "react";
import { getAddress } from "viem";
import { RoundWithStakes } from "@/types/backend";
import { calculateStakeInfo } from "../utils/calculateStakeInfo";

export type ProjectData = {
  name: string;
  image: string;
  variant: "leaderboard" | "stake" | string;
  id: string;
  chainId: number;
  roundId: string;
  tokenUsdValue: number;
  totalStaked: number;
  numberOfContributors: number;
  totalDonations: number;
  anchorAddress: string;
  isStakingPeriodOver: boolean;
  rank: number;
  amount?: number;
  stakedAt?: Date;
};

export type SortOption = "totalStaked" | "totalDonations" | "contributors";

export const useProjectsData = (
  poolSummary: RoundWithStakes | undefined,
  chainId: string | undefined,
  roundId: string | undefined,
  isRoundOver: boolean,
  sortOption: SortOption,
  isLocking: boolean,
  isLeaderboard: boolean,
  gtcPrice: number,
  staker?: string,
) => {
  return useMemo(() => {
    if (!poolSummary || !chainId || !roundId) return [];

    const mappedProjects = poolSummary.applications.map((app, index) => {
      // Calculate stake info if staker is provided
      const stakeInfo = staker
        ? calculateStakeInfo(poolSummary.stakes, staker, app.anchorAddress)
        : undefined;

      return {
        name: app.project.metadata.title,
        image: "https://d16c97c2np8a2o.cloudfront.net/ipfs/" + app.project.metadata.logoImg || "",
        variant: isLeaderboard ? "leaderboard" : "stake",
        id: app.id,
        chainId: Number(chainId),
        roundId: roundId,
        tokenUsdValue: gtcPrice, // TODO: get from backend
        totalStaked:
          Number(poolSummary.totalStakesByAnchorAddress[getAddress(app.anchorAddress)] ?? 0) / 1e18,
        numberOfContributors: app.uniqueDonorsCount,
        totalDonations: app.totalAmountDonatedInUsd,
        anchorAddress: app.anchorAddress,
        isStakingPeriodOver: isRoundOver,
        rank: index + 1, // Default rank based on original order
        // Add stake info if available
        stakedAmount: stakeInfo?.amount,
        stakedAt: stakeInfo?.stakedAt,
      };
    });

    // Sort based on selected option and update ranks
    return sortProjects(mappedProjects, sortOption);
  }, [poolSummary, chainId, roundId, isLocking, sortOption, isRoundOver, staker, isLeaderboard]);
};

export const sortProjects = (projects: ProjectData[], sortOption: SortOption): ProjectData[] => {
  // First sort the projects
  const sortedProjects = [...projects].sort((a, b) => {
    switch (sortOption) {
      case "totalStaked":
        // If one has stakes and the other doesn't, the one with stakes ranks higher
        if (a.totalStaked > 0 && b.totalStaked === 0) return -1;
        if (b.totalStaked > 0 && a.totalStaked === 0) return 1;
        // If both have stakes, compare by stake amount
        if (a.totalStaked !== b.totalStaked) {
          return b.totalStaked - a.totalStaked;
        }
        // If stakes are equal, sort by contributor count
        return b.numberOfContributors - a.numberOfContributors;

      case "totalDonations":
        return b.totalDonations - a.totalDonations;

      case "contributors":
        return b.numberOfContributors - a.numberOfContributors;

      default:
        return 0;
    }
  });

  // Then update the ranks based on the new order
  return sortedProjects.map((project, index) => ({
    ...project,
    rank: index + 1,
  }));
};
