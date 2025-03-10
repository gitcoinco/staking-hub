import { StakeProjectCard } from "@gitcoin/ui/project";
import { useCallback, useState, useMemo } from "react";
import { Badge, Button, Icon, IconLabel, IconType, Input } from "@gitcoin/ui";
import { DateFormat, getChainInfo } from "@gitcoin/ui/lib";

const mockStakeProjectCardProps: any[] = [
  {
    name: "Project1",
    image: "https://picsum.photos/200",
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
    image: "https://picsum.photos/201",
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
    image: "https://picsum.photos/202",
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
  const [amountToApplyToAll, setAmountToApplyToAll] = useState<number | null>(
    null
  );

  const chainInfo = getChainInfo(1);
  const numProjects = mockStakeProjectCardProps.length;

  // Derived total staked
  const totalStaked = useMemo(
    () =>
      Object.values(applicationsToStakeAmount).reduce(
        (sum, amount) => sum + amount,
        0
      ),
    [applicationsToStakeAmount]
  );

  const handleStakeChange = useCallback((projectId: string, amount: number) => {
    setApplicationsToStakeAmount((prev) => ({
      ...prev,
      [projectId]: Math.max(0, amount),
    }));
  }, []);

  const handleApplyToAll = useCallback(() => {
    if (amountToApplyToAll === null) return;

    const maxPerProject = userGTCBalance / numProjects;
    const clampedValue = Math.min(amountToApplyToAll, maxPerProject);

    const newStakes = mockStakeProjectCardProps.reduce(
      (acc, project) => ({
        ...acc,
        [project.id]: clampedValue,
      }),
      {}
    );

    setApplicationsToStakeAmount(newStakes);
  }, [amountToApplyToAll, numProjects]);
  // Add this helper function at the top
  const calculateMaxStake = (
    userBalance: number,
    totalStaked: number,
    currentStake: number
  ) => {
    const remainingBalance = userBalance - (totalStaked - currentStake);
    return Math.max(0, Math.min(remainingBalance, userBalance));
  };
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
              onClick={handleApplyToAll}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {mockStakeProjectCardProps.map((props) => {
            const currentStake = applicationsToStakeAmount[props.id] || 0;
            const maxStake = calculateMaxStake(
              userGTCBalance,
              totalStaked,
              currentStake
            );

            return (
              <StakeProjectCard
                key={props.id}
                {...props}
                onStakeChange={handleStakeChange}
                maxStakeAmount={maxStake}
                stakeAmount={currentStake}
              />
            );
          })}
        </div>
        <div className="flex justify-between items-center px-6 py-4 rounded-lg bg-grey-50">
          <div className="flex flex-col items-start">
            <span className="text-base font-bold font-ui-sans">
              {`${Number(Number(totalStaked).toFixed(2))} GTC`}
            </span>
            <span className="text-sm font-normal font-ui-sans">
              Total GTC to stake
            </span>
          </div>
          <Button
            variant="primary"
            value="Stake on selected grant(s)"
            className="bg-purple-300 text-black"
          />
        </div>
      </div>
    </div>
  );
};
