import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Badge,
  Button,
  Icon,
  IconLabel,
  IconType,
  Input,
  ProgressModal,
  Select,
} from "@gitcoin/ui";
import { DateFormat, getChainInfo } from "@gitcoin/ui/lib";
import { StakeProjectCard } from "@gitcoin/ui/project";
import { useAccount } from "wagmi";
import { LoadingPage } from "@/components/Loading";
import { useGetPoolSummaries } from "@/hooks/backend";
import { useLock } from "@/hooks/contracts";
import { useSquidWidget } from "@/hooks/frontend";
import { useGetTokenData, useGTC } from "@/hooks/tokens";
import { useProjectsData } from "@/pages/StakingRound/hooks/useProjectsData";
import { useStakingRoundState } from "@/pages/StakingRound/hooks/useStakingRound";
import { StakeConfirmationDialog } from "./components/stakeConfirmationDialog";
import {
  calculateMaxStake,
  getLeaderboardTitle,
  getLockDataParallelToApplicationIds,
  getRoundTimeInfo,
  getSortOptions,
  getStakeConfirmationDialogData,
} from "./utils/stakingRound";

export const StakingRound = () => {
  const { chainId, roundId } = useParams();
  const [searchParams] = useSearchParams();

  const applicationId = searchParams.get("id");

  const { formatted: userGTCBalance, price: gtcPrice } = useGTC();
  const {
    data: poolSummary,
    isLoading,
    refetch,
  } = useGetPoolSummaries(roundId ?? "", chainId ?? "");
  const { lock, steps, isLoading: isLocking } = useLock();
  const { setIsSquidOpen } = useSquidWidget();
  const { address } = useAccount();

  // Get time information for the round
  const {
    isRoundOver,
    timeLeftMessage,
    hasStarted: isRoundStarted = false,
  } = getRoundTimeInfo(poolSummary?.donationsEndTime, poolSummary?.donationsStartTime);
  const [isStakeConfirmationDialogOpen, setIsStakeConfirmationDialogOpen] = useState(false);

  // Use custom hooks for state management and data processing
  const {
    applicationsToStakeAmount,
    amountToApplyToAll,
    sortOption,
    totalStaked,
    setAmountToApplyToAll,
    handleStakeChange,
    handleApplyToAll,
    handleClearAll,
    handleSortChange,
  } = useStakingRoundState();

  const applicationToStake = () => {
    if (applicationId) {
      const props = projects.find((project) => project.id === applicationId);
      if (!props) {
        return null;
      }

      const currentStake = applicationsToStakeAmount[props.id] || 0;
      const maxStake = calculateMaxStake(Number(userGTCBalance), totalStaked, currentStake);

      return (
        <StakeProjectCard
          key={props.id}
          {...props}
          variant={"leaderboard"}
          onStakeChange={handleStakeChange}
          maxStakeAmount={maxStake}
          stakeAmount={currentStake}
        />
      );
    }

    return null;
  };

  // Get sorted projects data
  const projects = useProjectsData(
    poolSummary,
    chainId,
    roundId,
    isRoundOver,
    isRoundStarted,
    sortOption as any,
    isLocking,
    gtcPrice,
    address,
  );

  const lockData = useMemo(
    () => getLockDataParallelToApplicationIds(projects, applicationsToStakeAmount),
    [projects, applicationsToStakeAmount],
  );

  const confirmStakeData = useMemo(
    () => getStakeConfirmationDialogData(projects, applicationsToStakeAmount),
    [projects, applicationsToStakeAmount],
  );

  const handleStakeConfirmation = async () => {
    setIsStakeConfirmationDialogOpen(false);
    await lock(lockData);
    await refetch();
    handleClearAll();
  };

  // Modify the projects filtering logic
  const filteredProjects = useMemo(() => {
    if (!applicationId || !projects.length) return projects;

    // Filter out the selected application from the leaderboard
    return projects.filter((project) => project.id !== applicationId);
  }, [projects, applicationId]);

  // Update maxAmountToApplyToAll calculation
  const maxAmountToApplyToAll = useMemo(() => {
    // Get the selected project's current stake amount
    const selectedProjectCurrentStake = applicationId
      ? applicationsToStakeAmount[applicationId] || 0
      : 0;

    // Calculate available balance considering the current stake of selected project
    const availableBalance = Number(userGTCBalance) - selectedProjectCurrentStake;

    // Use filteredProjects.length for division (projects excluding the selected one)
    const projectCount = filteredProjects.length || 1; // Prevent division by zero

    return Math.max(0, availableBalance / projectCount);
  }, [userGTCBalance, applicationId, filteredProjects.length, applicationsToStakeAmount]);

  // Get sort options for the dropdown
  const sortOptions = getSortOptions();
  const { data: tokenData, isLoading: isTokenDataLoading } = useGetTokenData(
    Number(poolSummary?.chainId),
    poolSummary?.matchTokenAddress ?? "",
  );

  if (!chainId || !roundId) {
    return <div>Invalid params</div>;
  }

  if (isLoading || isTokenDataLoading) {
    return <LoadingPage />;
  }

  if (!poolSummary || !tokenData) {
    return <div>No pool summary found</div>;
  }

  const stakingRewardsAmountInUSD =
    ((poolSummary.roundMetadata.quadraticFundingConfig.matchingFundsAvailable * 3) / 100) *
    tokenData.price;

  // Get chain information
  const chainInfo = getChainInfo(Number(chainId));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-semibold">{poolSummary.roundMetadata.name}</span>
              <Badge className={isRoundOver ? "bg-grey-100" : "bg-blue-100"}>
                {timeLeftMessage}
              </Badge>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button
                value="Get GTC"
                icon={<Icon type={IconType.ARROW_RIGHT} className="size-4" />}
                iconPosition="right"
                className="bg-blue-100 text-black"
                onClick={() => setIsSquidOpen(true)}
              />
            </div>
          </div>
          <div className="mt-1 flex justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span>On</span>
                <IconLabel type="default" label={chainInfo.name} iconType={chainInfo.icon} />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span>Stake period</span>
                <IconLabel
                  type="period"
                  startDate={new Date(poolSummary.donationsStartTime)}
                  endDate={new Date(poolSummary.donationsEndTime)}
                  dateFormat={DateFormat.ShortMonthDayYear24HourUTC}
                  textVariant="text-base font-normal font-ui-sans leading-7 h-7 px-2 bg-grey-50 rounded"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                type={IconType.LIGHTNING_BOLT}
                className="size-6 fill-purple-500 stroke-purple-500"
              />
              <div className="flex flex-col">
                <span className="font-ui-mono text-sm font-medium">Staking rewards</span>
                <span className="font-ui-mono text-sm font-normal">
                  {`$${Number(stakingRewardsAmountInUSD.toFixed(2))} USD`}
                </span>
              </div>
            </div>
          </div>
          <div className="font-ui-sans mt-4 line-clamp-2 text-base font-normal leading-7 text-black">
            {poolSummary.roundMetadata.eligibility.description}
          </div>
        </div>

        {applicationToStake()}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-3xl font-semibold">
            {getLeaderboardTitle(sortOption)}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-4">
            {/* Sort options using Select */}
            <div className="flex items-center gap-2">
              <div className="font-ui-sans text-body text-nowrap font-medium">Order by</div>
              <Select
                options={sortOptions}
                value={sortOption}
                defaultValue="totalStaked"
                onValueChange={handleSortChange}
                className="border-grey-100 h-9 gap-2 outline-none ring-transparent focus:border-2 focus:shadow-none focus:outline-0 focus:ring-transparent"
                variant="default"
                size="md"
              />
            </div>

            {/* Apply to all section */}
            {!isRoundOver && isRoundStarted && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={maxAmountToApplyToAll}
                  value={amountToApplyToAll === null ? "" : amountToApplyToAll}
                  placeholder="Amount (GTC)"
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    // Ensure the input value doesn't exceed maxAmountToApplyToAll
                    setAmountToApplyToAll(Math.min(value, maxAmountToApplyToAll));
                  }}
                  className="h-9 w-40 px-3 py-2 outline-none ring-transparent focus:border-2 focus:shadow-none focus:outline-0 focus:ring-transparent"
                />
                <span className="text-grey-500 font-ui-sans shrink-0 text-xs font-normal leading-[14px]">
                  {`~${amountToApplyToAll ? Number(amountToApplyToAll * gtcPrice).toFixed(2) : 0} USD`}
                </span>
                <Button
                  value="Apply to All"
                  variant="light-purple"
                  className="text-purple-700"
                  onClick={() => handleApplyToAll(filteredProjects, applicationId ?? undefined)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex max-h-[750px] flex-col gap-2 overflow-y-auto">
          {filteredProjects.length === 0 && (
            <div className="flex h-[200px] items-center justify-center">
              <span className="font-ui-sans text-base font-bold">No projects found</span>
            </div>
          )}
          {filteredProjects.map((props) => {
            const currentStake = applicationsToStakeAmount[props.id] || 0;
            const maxStake = calculateMaxStake(Number(userGTCBalance), totalStaked, currentStake);

            return (
              <StakeProjectCard
                key={props.id}
                {...props}
                variant={"leaderboard"}
                onStakeChange={handleStakeChange}
                maxStakeAmount={maxStake}
                stakeAmount={currentStake}
              />
            );
          })}
        </div>
      </div>
      <div className="bg-grey-50 flex items-center justify-between rounded-lg px-6 py-4">
        <div className="flex flex-col items-start">
          <span className="font-ui-sans text-base font-bold">
            {`${Number(Number(totalStaked).toFixed(2))} GTC`}
          </span>
          <span className="font-ui-sans text-sm font-normal">Total GTC to stake</span>
        </div>
        <Button
          variant="primary"
          value="Stake on selected grant(s)"
          className={`bg-purple-300 text-black ${isRoundOver || !confirmStakeData.length ? "opacity-50" : ""}`}
          onClick={() => setIsStakeConfirmationDialogOpen(true)}
          disabled={isRoundOver || !confirmStakeData.length}
        />
      </div>
      <StakeConfirmationDialog
        projectsToStake={confirmStakeData}
        isOpen={isStakeConfirmationDialogOpen}
        onOpenChange={setIsStakeConfirmationDialogOpen}
        onConfirm={handleStakeConfirmation}
      />
      <ProgressModal isOpen={isLocking} steps={steps} />
    </div>
  );
};
