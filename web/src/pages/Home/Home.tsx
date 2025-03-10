import { useAccount } from "wagmi";
import { NotConnected } from "./components/NotConnected";
import { StatCardGroup, StatCardGroupProps } from "@gitcoin/ui";
import { StakePoolCard, StakePoolDataCardProps } from "@gitcoin/ui/pool";
import { useNavigate } from "react-router-dom";
import { useGetStakerOverview } from "@/hooks/backend";

const formatTokenAmount = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

export const Home = () => {
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();

  if (!isConnected || !address) {
    return <NotConnected />;
  }

  const { data: stakeOverview, isLoading } = useGetStakerOverview(address);

  if (isLoading || !stakeOverview) {
    return <div>Loading...</div>;
  }

  // Convert wei to GTC (18 decimals)
  const currentlyStaked = Number(stakeOverview.currentlyStaked) / 1e18;

  const statCardGroupProps: StatCardGroupProps = {
    stats: [
      {
        label: "Current GTC staked",
        value: `${formatTokenAmount(currentlyStaked)} GTC`,
        className: "bg-moss-50 w-full",
      },
      {
        label: "Total rewards",
        value: `${stakeOverview.rewards.length} Rewards`,
        className: "bg-purple-50 w-full",
      },
      {
        label: "Total # of stakes",
        value: stakeOverview.stakes.length.toString(),
        className: "bg-blue-50 w-full",
      },
    ],
  };

  if (stakeOverview.poolsOverview.length === 0) {
    return (
      <div>
        <StatCardGroup
          {...statCardGroupProps}
          className="grid xl:grid-cols-3 grid-cols-1"
        />
        <div className="mt-8 text-center text-gray-500">
          No active stake pools available
        </div>
      </div>
    );
  }

  const stakePoolCards: StakePoolDataCardProps[] = stakeOverview.poolsOverview.map(pool => ({
    roundName: pool.roundMetadata.name,
    roundDescription: pool.roundMetadata.eligibility.description,
    chainId: pool.chainId,
    roundId: pool.id,
    votingStartDate: new Date(pool.donationsStartTime),
    votingEndDate: new Date(pool.donationsEndTime),
    totalProjects: pool.approvedProjectCount,
    totalStaked: Number(pool.totalStaked) / 1e18,
    matchingPoolAmount: pool.roundMetadata.quadraticFundingConfig.matchingFundsAvailable,
    stakedAmount: stakeOverview.stakes
      .filter(stake => stake.chainId === pool.chainId && stake.poolId === pool.id)
      .reduce((acc, stake) => acc + Number(stake.amount), 0) / 1e18,
    lastStakeDate: new Date(Math.max(...stakeOverview.stakes
      .filter(stake => stake.chainId === pool.chainId && stake.poolId === pool.id)
      .map(stake => Number(stake.blockTimestamp) * 1000))),
    claimed: stakeOverview.claims.some(claim => 
      claim.chainId === pool.chainId && claim.poolId === pool.id),
    isLoading: false,
    onClaim: () => {}
  }));

  return (
    <div>
      <div className="flex flex-col gap-8">
        <StatCardGroup
          {...statCardGroupProps}
          className="grid xl:grid-cols-3 grid-cols-1"
        />
        <div className="flex flex-col gap-6">
          <span className="text-2xl font-medium font-ui-sans">
            {`Active Stakes (${stakePoolCards.length})`}
          </span>
          {stakePoolCards.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
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
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No active stakes found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
