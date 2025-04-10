import { useMemo } from "react";
import { getAddress } from "viem";
import { RoundWithStakes } from "@/types/backend";
import { calculateStakeInfo } from "../utils/calculateStakeInfo";

export type ProjectData = {
  name: string;
  image: string;
  id: string;
  chainId: number;
  roundId: string;
  tokenUsdValue: number;
  totalStaked: number;
  numberOfContributors: number;
  totalDonations: number;
  anchorAddress: string;
  isStakingPeriod: boolean;
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
  isRoundStarted: boolean,
  sortOption: SortOption,
  isLocking: boolean,
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

      const imageCid = app.metadata.application.project.logoImg;

      return {
        name: app.metadata.application.project.title,
        description: app.metadata.application.project.description,
        image: imageCid
          ? `https://d16c97c2np8a2o.cloudfront.net/ipfs/${imageCid}`
          : "https://d16c97c2np8a2o.cloudfront.net/ipfs/bafkreihbauobycfxsvr5gm5kad7r74vequsz3dcuozvqori3aukm7hnsju",
        id: app.id,
        chainId: Number(chainId),
        roundId: roundId,
        tokenUsdValue: gtcPrice, // TODO: get from backend
        totalStaked: Number(
          (Number(poolSummary.totalStakesByAnchorAddress[getAddress(app.anchorAddress)] ?? 0) /
            1e18)
            .toFixed(2),
        ),
        numberOfContributors: app.uniqueDonorsCount,
        totalDonations: Number(app.totalAmountDonatedInUsd.toFixed(2)),
        anchorAddress: app.anchorAddress,
        isStakingPeriod: !isRoundOver && isRoundStarted,
        rank: index + 1, // Default rank based on original order
        // Add stake info if available
        stakedAmount: stakeInfo?.amount && Number(stakeInfo?.amount.toFixed(17)),
        stakedAt: stakeInfo?.stakedAt,
      };
    });

    // Sort based on selected option and update ranks
    return sortProjects(mappedProjects, sortOption);
  }, [poolSummary, chainId, roundId, isLocking, sortOption, isRoundOver, staker]);
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
