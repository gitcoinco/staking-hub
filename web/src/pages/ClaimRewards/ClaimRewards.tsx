import { StakeProjectCard, StakeProjectCardProps } from "@gitcoin/ui/project";

const availableToClaimCardProps: StakeProjectCardProps[] = [
  {
    name: "Project Name",
    variant: "staked",
    id: "1",
    chainId: 1,
    roundId: "1",
    amount: 100,
    stakedAt: new Date(),
    unlockAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 10),
  },
  {
    name: "Project Name",
    variant: "staked",
    id: "2",
    chainId: 1,
    roundId: "1",
    amount: 100,
    stakedAt: new Date(),
    unlockAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 10),
  },
];

const claimRewardsCardProps: StakeProjectCardProps[] = [
  {
    name: "Project Name",
    variant: "claimed",
    id: "1",
    chainId: 1,
    roundId: "1",
    amount: 100,
    stakedAt: new Date(),
    unlockAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10),
    claimedAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
    txHash: "0x123",
  },
  {
    name: "Project Name",
    variant: "claimed",
    id: "2",
    chainId: 1,
    roundId: "1",
    amount: 100,
    stakedAt: new Date(),
    unlockAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10),
    claimedAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
    txHash: "0x123",
  },
];

const upcomingStakeCardProps: StakeProjectCardProps[] = [
  {
    name: "Project Name",
    variant: "staked",
    id: "1",
    chainId: 1,
    roundId: "1",
    amount: 100,
    stakedAt: new Date(),
    unlockAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10),
  },
  {
    name: "Project Name",
    variant: "staked",
    id: "2",
    chainId: 1,
    roundId: "1",
    amount: 100,
    stakedAt: new Date(),
    unlockAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10),
  },
];

export const ClaimRewards = () => {
  return (
    <div className="flex flex-col gap-4">
      <div>Available to claim</div>
      <div className="flex flex-col gap-4">
        {availableToClaimCardProps.map((props) => (
          <StakeProjectCard key={props.id} {...props} />
        ))}
      </div>
      <div>Upcoming stakes</div>
      <div className="flex flex-col gap-4">
        {upcomingStakeCardProps.map((props) => (
          <StakeProjectCard key={props.id} {...props} />
        ))}
      </div>
      <div>Claimed stakes</div>
      <div className="flex flex-col gap-4">
        {claimRewardsCardProps.map((props) => (
          <StakeProjectCard key={props.id} {...props} />
        ))}
      </div>
    </div>
  );
};
