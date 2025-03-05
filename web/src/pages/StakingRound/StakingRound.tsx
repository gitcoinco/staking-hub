import { StakeProjectCard, StakeProjectCardProps } from "@gitcoin/ui/project";
import { useCallback, useState, useMemo } from "react";

const mockStakeProjectCardProps: any[] = [
  {
    name: "Project Name",
    variant: "leaderboard",
    id: "1",
    chainId: 1,
    roundId: "1",
    rank: 1,
    tokenUsdValue: 0.4,
  },
  {
    name: "Project2",
    variant: "leaderboard",
    id: "2",
    chainId: 1,
    roundId: "1",
    rank: 2,
    tokenUsdValue: 0.4,
  },
  {
    name: "Project3",
    variant: "leaderboard",
    id: "3",
    chainId: 1,
    roundId: "1",
    rank: 3,
    tokenUsdValue: 0.4,
  },
];

const userGTCBalance = 100;

export const StakingRound = () => {
  const [applicationsToStakeAmount, setApplicationsToStakeAmount] = useState<
    Record<string, number>
  >({});

  const totalStaked = useMemo(() => {
    return Object.values(applicationsToStakeAmount).reduce(
      (sum, amount) => sum + amount,
      0
    );
  }, [applicationsToStakeAmount]);

  const remainingBalance = userGTCBalance - totalStaked;

  const handleStakeChange = useCallback((projectId: string, amount: number) => {
    setApplicationsToStakeAmount((prev) => {
      const otherProjectsTotal = Object.entries(prev)
        // .filter(([id]) => id !== projectId)
        .reduce((sum, [, amount]) => sum + amount, 0);

      const maxStake = Math.max(0, userGTCBalance - otherProjectsTotal);
      const newAmount = Math.min(maxStake, Math.max(0, amount));

      return {
        ...prev,
        [projectId]: newAmount,
      };
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {/* TODO FIX THE ROUND CARD AND THE LEADERBOARD */}
        <span>Round 1</span>
        <span>Stake GTC to earn $GTC</span>
        <span>Remaining Balance: {remainingBalance} GTC</span>
        <div className="h-2 bg-grey-200 rounded-full">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(remainingBalance / userGTCBalance) * 100}%` }}
          />
        </div>
      </div>
      <span>Leaderboard</span>
      <div className="flex flex-col gap-4">
        {mockStakeProjectCardProps.map((props) => {
          const currentStake = applicationsToStakeAmount[props.id] || 0;
          const otherProjectsTotal = totalStaked;
          const maxStake = Math.max(0, userGTCBalance - otherProjectsTotal);

          return (
            <StakeProjectCard
              key={props.id}
              {...props}
              onStakeChange={(amount) =>
                handleStakeChange(props.id, Math.min(Number(amount), maxStake))
              }
              maxStakeAmount={maxStake}
              currentStakeAmount={currentStake}
            />
          );
        })}
      </div>
    </div>
  );
};
