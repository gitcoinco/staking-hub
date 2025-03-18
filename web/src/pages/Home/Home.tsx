import { useNavigate } from "react-router-dom";
import { StatCardGroup } from "@gitcoin/ui";
import { StakePoolCard } from "@gitcoin/ui/pool";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { LoadingPage } from "@/components/Loading";
import { useGetStakerOverview } from "@/hooks/backend";
import { useGetRewardsAmountInUSD } from "@/hooks/tokens";
import { getClaimedRewardsInUSDParams } from "./utils/getClaimedRewardsInUSDParams";
import { getStakePoolCards } from "./utils/getStakePoolCards";
import { getStatCardGroupProps } from "./utils/getStatCardGroupProps";

export const Home = () => {
  const { address } = useAccount();
  const navigate = useNavigate();

  const { data: stakeOverview, isLoading } = useGetStakerOverview(address ?? zeroAddress);

  const { data: claimedRewardsAmountInUSD, isLoading: isClaimedRewardsAmountInUSDLoading } =
    useGetRewardsAmountInUSD(getClaimedRewardsInUSDParams(stakeOverview));

  if (
    isLoading ||
    isClaimedRewardsAmountInUSDLoading ||
    !stakeOverview ||
    claimedRewardsAmountInUSD === undefined
  ) {
    return <LoadingPage />;
  }

  const stakePoolCards = getStakePoolCards(stakeOverview);
  const statCardGroupProps = getStatCardGroupProps(stakeOverview, claimedRewardsAmountInUSD);

  return (
    <div>
      <div className="flex flex-col gap-8">
        <StatCardGroup {...statCardGroupProps} className="grid grid-cols-1 xl:grid-cols-3" />
        <div className="flex flex-col gap-6">
          <span className="font-ui-sans text-2xl font-medium">
            {`All Stakes (${stakePoolCards.length})`}
          </span>
          {stakePoolCards.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {stakePoolCards.map((card) => (
                  <StakePoolCard
                    key={`${card.chainId}-${card.roundId}`}
                    data={{
                      ...card,
                      onClick: () => navigate(`/staking-round/${card.chainId}/${card.roundId}`),
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">You haven't staked in any round yet</div>
          )}
        </div>
      </div>
    </div>
  );
};
