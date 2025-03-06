import { StakeProjectCard, StakeProjectCardProps } from "@gitcoin/ui/project";
import { useCallback, useState, useMemo } from "react";
import { Badge, Button, Icon, IconLabel, IconType, Input } from "@gitcoin/ui";
import { DateFormat, getChainInfo } from "@gitcoin/ui/lib";

const mockStakeProjectCardProps: any[] = [
  {
    name: "Project1",
    variant: "leaderboard",
    id: "1",
    chainId: 1,
    roundId: "1",
    rank: 1,
    tokenUsdValue: 0.4,
    totalStaked: 100,
    numberOfContributors: 10,
    totalDonations: 10,
  },
  {
    name: "Project2",
    variant: "leaderboard",
    id: "2",
    chainId: 1,
    roundId: "1",
    rank: 2,
    tokenUsdValue: 0.4,
    totalStaked: 100,
    numberOfContributors: 10,
    totalDonations: 10,
  },
  {
    name: "Project3",
    variant: "leaderboard",
    id: "3",
    chainId: 1,
    roundId: "1",
    rank: 3,
    tokenUsdValue: 0.4,
    totalStaked: 100,
    numberOfContributors: 10,
    totalDonations: 10,
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

  const chainInfo = getChainInfo(1);

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

  const [amountToApplyToAll, setAmountToApplyToAll] = useState<number | null>(
    null
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-2">
        {/* TODO FIX THE ROUND CARD AND THE LEADERBOARD */}
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-semibold">Round Name Here</span>
            <Badge className="bg-blue-100">10 days left</Badge>
          </div>
          <div>
            <Button
              value="Get GTC"
              icon={<Icon type={IconType.ARROW_RIGHT} className="size-4" />}
              iconPosition="right"
              className="bg-blue-100 text-black"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>On</span>
          <IconLabel
            type="default"
            label={chainInfo.name}
            iconType={chainInfo.icon}
          />
        </div>
        <div className="flex items-center gap-2">
          <span>Stake period</span>
          <IconLabel
            type="period"
            startDate={new Date()}
            endDate={new Date(Date.now() + 1000 * 60 * 60 * 24 * 10)}
            dateFormat={DateFormat.ShortMonthDayYear24HourUTC}
            textVariant="text-base font-normal font-ui-sans leading-7 h-7 px-2 bg-grey-50 rounded"
          />
        </div>
        <div className="text-black text-base font-normal font-ui-sans leading-7">
          Round description here, short bio letting users know the intent behind
          the grant round.
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-3xl font-semibold">
            Leaderboard - Total Staked
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={userGTCBalance / mockStakeProjectCardProps.length}
              value={amountToApplyToAll || ""}
              placeholder="Amount (GTC)"
              onChange={(e) => setAmountToApplyToAll(Number(e.target.value))}
              className="h-9 px-3 py-2 outline-none ring-transparent focus:ring-transparent focus:outline-0 focus:border-2 focus:shadow-none"
            />
            <span className="text-grey-500 text-xs font-normal font-ui-sans leading-[14px] shrink-0">
              {`~${amountToApplyToAll ? Number(amountToApplyToAll * 0.4).toFixed(2) : 0} USD`}
            </span>
            <Button
              value="Apply to All"
              variant="light-purple"
              className="text-purple-700"
            />
          </div>
        </div>
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
                  handleStakeChange(
                    props.id,
                    Math.min(Number(amount), maxStake)
                  )
                }
                maxStakeAmount={maxStake}
                currentStakeAmount={currentStake}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
