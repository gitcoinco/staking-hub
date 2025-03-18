import { useMemo } from "react";
import { getTokensByChainId } from "@gitcoin/gitcoin-chain-data";
import { StakePoolDataCardProps } from "@gitcoin/ui/pool";
import { getAddress } from "viem";
import { PoolOverview } from "@/types/backend";
import { PoolStatus, getPoolStatus } from "../utils/poolStatus";

export type StakePoolCardData = StakePoolDataCardProps & { status: PoolStatus };

export const usePoolsData = (poolsOverview: PoolOverview[] | undefined) => {
  return useMemo(() => {
    if (!poolsOverview || poolsOverview.length === 0) return [];

    // Map pool data and add status
    return poolsOverview.map((pool) => {
      const votingStartDate = new Date(pool.donationsStartTime);
      const votingEndDate = new Date(pool.donationsEndTime);
      const status = getPoolStatus(votingStartDate, votingEndDate);
      // Get token information
      const nativePayoutToken = getTokensByChainId(Number(pool.chainId)).find(
        (t) => t.address === getAddress(pool.matchTokenAddress),
      );

      const tokenData = {
        ...nativePayoutToken,
        symbol: nativePayoutToken?.code ?? "ETH",
      };

      return {
        roundName: pool.roundMetadata.name,
        roundDescription: pool.roundMetadata.eligibility.description,
        chainId: pool.chainId,
        roundId: pool.id,
        votingStartDate,
        votingEndDate,
        totalProjects: pool.approvedProjectCount,
        totalStaked: Number(pool.totalStaked) / 1e18,
        matchingPoolAmount: pool.roundMetadata.quadraticFundingConfig.matchingFundsAvailable,
        stakedAmount: 0, // todo: add staked amount to backend
        matchingPoolTokenTicker: tokenData.symbol,
        isLoading: false,
        status,
      };
    });
  }, [poolsOverview]);
};
