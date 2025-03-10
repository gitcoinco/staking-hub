import { Button } from "@gitcoin/ui";
import { cn } from "@gitcoin/ui/lib";
import { StakeProjectCardProps } from "@gitcoin/ui/project";

import { StakePoolCard } from "@gitcoin/ui/pool";

const simpleRound = {
  roundName: "Grants Round Defi",
  roundDescription: "Grants Round Defi description text here",
  roundId: "90",
  chainId: 10,
  votingStartDate: new Date("2024-12-09T19:22:56.413Z"),
  votingEndDate: new Date("2024-12-10T19:23:30.678Z"),
  onClick: (pool?: { chainId: number; roundId: string }) => {
    console.log(pool);
  },
  createdAtBlock: 123456,
  matchingPoolAmount: 100000,
  stakedAmount: 100000,
  totalProjects: 100,
  totalStaked: 100000,
  lastStakeDate: new Date("2024-12-08T19:22:56.413Z"),
  onClaim: () => void 0,
};

const availableToClaimCardProps: StakeProjectCardProps[] = [
  {
    name: "Project Name",
    description: "Project Description",
    image: "https://picsum.photos/200",
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
    description: "Project Description",
    image: "https://picsum.photos/200",
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
    description: "Project Description",
    image: "https://picsum.photos/200",
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
    description: "Project Description",
    image: "https://picsum.photos/200",
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
    description: "Project Description",
    image: "https://picsum.photos/200",
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
    description: "Project Description",
    image: "https://picsum.photos/200",
    variant: "staked",
    id: "2",
    chainId: 1,
    roundId: "1",
    amount: 100,
    stakedAt: new Date(),
    unlockAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10),
  },
];

const claimablePools = [
  {
    ...simpleRound,
    roundId: "91",
    roundName: "Grants Round Defi",
    stakedProjects: availableToClaimCardProps,
  },
  {
    ...simpleRound,
    roundId: "91",
    roundName: "Grants Round Defi 2",
    stakedProjects: availableToClaimCardProps,
  },
];

const pendingPools = [
  {
    ...simpleRound,
    roundId: "92",
    roundName: "Grants Round Defi 3",
    votingEndDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10),
    stakedProjects: upcomingStakeCardProps,
  },
];

const claimedPools = [
  {
    ...simpleRound,
    roundId: "93",
    roundName: "Grants Round Defi 4",
    claimed: true,
    stakedProjects: claimRewardsCardProps,
  },
];

export const ClaimRewards = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center bg-purple-50 rounded-lg py-6 px-[56px]">
        <div className="flex flex-col items-start gap-2">
          <div className="text-grey-900 text-sm font-semibold font-ui-sans leading-7">
            Total claimable rewards
          </div>
          <div className="text-black text-[32px]/[41.66px] font-normal font-ui-mono leading-7">
            $100.00
          </div>
        </div>
        <div>
          <Button
            value="Claim all rewards"
            variant="ghost"
            className={cn(
              "text-purple-700 bg-white",
              "disabled:text-grey-500 disabled:bg-grey-100"
            )}
          />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <span className=" text-2xl font-medium font-ui-sans leading-7">
          {`Ready to claim (${claimablePools.length})`}
        </span>
        <div className="flex flex-col gap-4">
          {claimablePools.map((props) => (
            <StakePoolCard key={props.roundId} data={props} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <span className=" text-2xl font-medium font-ui-sans leading-7">
          {`Pending (${pendingPools.length})`}
        </span>
        <div className="flex flex-col gap-4">
          {pendingPools.map((props) => (
            <StakePoolCard key={props.roundId} data={props} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <span className=" text-2xl font-medium font-ui-sans leading-7">
          {`Claimed (${claimedPools.length})`}
        </span>
        <div className="flex flex-col gap-4">
          {claimedPools.map((props) => (
            <StakePoolCard key={props.roundId} data={props} />
          ))}
        </div>
      </div>
    </div>
  );
};
