import { useGetAllPoolsOverview } from "@/hooks/backend";
import { StakePoolCard, StakePoolDataCardProps } from "@gitcoin/ui/pool";
import { useNavigate } from "react-router-dom";

export const StakingRounds = () => {
  const navigate = useNavigate();
  const { data: poolsOverview, isLoading } = useGetAllPoolsOverview();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!poolsOverview || poolsOverview.length === 0) {
    return <div>No pools overview found</div>;
  }

  const stakePoolCards: StakePoolDataCardProps[] = poolsOverview.map(pool => ({
    roundName: pool.roundMetadata.name,
    roundDescription: pool.roundMetadata.eligibility.description,
    chainId: pool.chainId,
    roundId: pool.id,
    votingStartDate: new Date(pool.donationsStartTime),
    votingEndDate: new Date(pool.donationsEndTime),
    totalProjects: pool.approvedProjectCount,
    totalStaked: Number(pool.totalStaked) / 1e18,
    matchingPoolAmount: pool.roundMetadata.quadraticFundingConfig.matchingFundsAvailable,
    stakedAmount: 0, // todo: add staked amount to backend
    isLoading: false,
    onClaim: () => {}
  }));
  
  return (
    <div className="flex flex-col gap-4">
      {stakePoolCards.map((card) => (
        <StakePoolCard
          key={`${card.chainId}-${card.roundId}`}
          data={{
            ...card,
            onClick: () => navigate(`/staking-round/${card.chainId}/${card.roundId}`)
          }}
        />
      ))}
    </div>
  );
};
