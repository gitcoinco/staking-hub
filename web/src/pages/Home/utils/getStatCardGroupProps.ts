import { StatCardGroupProps } from "@gitcoin/ui";
import { StakerOverview } from "@/types/backend";

const formatTokenAmount = (amount: number): string => {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const getStatCardGroupProps = (
  stakeOverview: StakerOverview,
  claimedRewardsAmountInUSD: number,
): StatCardGroupProps => {
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
        label: "Total Staking Rewards",
        value: `$${claimedRewardsAmountInUSD.toFixed(2)}`,
        className: "bg-purple-50 w-full",
      },
      {
        label: "Total # of stakes",
        value: stakeOverview.stakes.length.toString(),
        className: "bg-blue-50 w-full",
      },
    ],
  };

  return statCardGroupProps;
};
