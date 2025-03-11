import { StakeProjectCard } from "@gitcoin/ui/project";
import { useCallback, useState, useMemo } from "react";
import { Badge, Button, Icon, IconLabel, IconType, Input } from "@gitcoin/ui";
import { DateFormat, getChainInfo } from "@gitcoin/ui/lib";
import { useGetPoolSummaries } from "@/hooks/backend";
import { useParams } from "react-router-dom";
import { getAddress } from "viem";

const userGTCBalance = 100;

export const StakingRound = () => {
  const { chainId, roundId } = useParams();
  const { data: poolSummary, isLoading } = useGetPoolSummaries(roundId ?? '', chainId ?? '');
  const [applicationsToStakeAmount, setApplicationsToStakeAmount] = useState<Record<string, number>>({});
  const [amountToApplyToAll, setAmountToApplyToAll] = useState<number | null>(null);

  // Memoize projects to use in callbacks
  const projects = useMemo(() => {
    if (!poolSummary || !chainId || !roundId) return [];
    
    return poolSummary.applications
      .map((app) => ({
        name: app.project.metadata.title,
        image: 'https://d16c97c2np8a2o.cloudfront.net/ipfs/' + app.project.metadata.logoImg || "",
        variant: "leaderboard" as const,
        id: app.id,
        chainId: Number(chainId),
        roundId: roundId,
        tokenUsdValue: 0.4, // TODO: get from backend
        totalStaked: Number(poolSummary.totalStakesByAnchorAddress[getAddress(app.anchorAddress)] ?? 0) / 1e18,
        numberOfContributors: app.totalDonationsCount,
        totalDonations: app.totalAmountDonatedInUsd,
      }))
      .sort((a, b) => {
        // If one has stakes and the other doesn't, the one with stakes ranks higher
        if (a.totalStaked > 0 && b.totalStaked === 0) return -1;
        if (b.totalStaked > 0 && a.totalStaked === 0) return 1;
        
        // If both have stakes, compare by stake amount
        if (a.totalStaked !== b.totalStaked) {
          return b.totalStaked - a.totalStaked;
        }
        
        // If neither have stakes or stakes are equal, sort by contributor count
        return b.numberOfContributors - a.numberOfContributors;
      })
      .map((project, index) => ({
        ...project,
        rank: index + 1,
      }));
  }, [poolSummary, chainId, roundId]);

  const totalStaked = useMemo(
    () => Object.values(applicationsToStakeAmount).reduce(
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

    const maxPerProject = userGTCBalance / projects.length;
    const clampedValue = Math.min(amountToApplyToAll, maxPerProject);

    const newStakes = projects.reduce(
      (acc, project) => ({
        ...acc,
        [project.id]: clampedValue,
      }),
      {}
    );

    setApplicationsToStakeAmount(newStakes);
  }, [amountToApplyToAll, projects]);

  if (!chainId || !roundId) {
    return <div>Invalid params</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!poolSummary) {
    return <div>No pool summary found</div>;
  }

  const chainInfo = getChainInfo(Number(chainId));
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
            <span className="text-3xl font-semibold">{poolSummary.roundMetadata.name}</span>
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
            startDate={new Date(poolSummary.donationsStartTime)}
            endDate={new Date(poolSummary.donationsEndTime)}
            dateFormat={DateFormat.ShortMonthDayYear24HourUTC}
            textVariant="text-base font-normal font-ui-sans leading-7 h-7 px-2 bg-grey-50 rounded"
          />
        </div>
        <div className="text-black text-base font-normal font-ui-sans leading-7">
          {poolSummary.roundMetadata.eligibility.description}
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-3xl font-semibold">
            Leaderboard - Total Staked
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={userGTCBalance / projects.length}
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
          {projects.map((props) => {
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
