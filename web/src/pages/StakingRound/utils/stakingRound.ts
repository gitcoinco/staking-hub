import moment from "moment";
import { Address, isAddress, parseUnits } from "viem";
import { STAKING_CHAIN_ID } from "@/services/web3/stakingConfig";

export type ProjectData = {
  name: string;
  image: string;
  id: string;
  chainId: number;
  roundId: string;
  tokenUsdValue: number;
  totalStaked: number;
  numberOfContributors: number;
  totalDonations: number;
  anchorAddress: string;
  isStakingPeriod: boolean;
  rank?: number;
};

export const calculateMaxStake = (
  userBalance: number,
  totalStaked: number,
  currentStake: number,
) => {
  const remainingBalance = userBalance - (totalStaked - currentStake);
  return Math.max(0, Math.min(remainingBalance, userBalance));
};

export const getLockDataParallelToApplicationIds = (
  projects: ProjectData[],
  applicationsToStakeAmount: Record<string, number>,
) => {
  const data = projects
    .map((project) => ({
      amount: parseUnits(
        (applicationsToStakeAmount[project.id] || 0).toLocaleString("en-US", {
          maximumFractionDigits: 18,
          useGrouping: false,
        }),
        18,
      ),
      recipientAddress: project.anchorAddress,
      poolId: project.roundId,
      chainId: project.chainId,
    }))
    .filter((d) => !!d.amount && isAddress(d.recipientAddress));

  return {
    amounts: data.map((d) => d.amount),
    recipientIds: data.map((d) => d.recipientAddress as Address),
    chainIds: data.map((d) => BigInt(d.chainId)),
    poolIds: data.map((d) => BigInt(d.poolId)),
    // TODO: make this dynamic but for now it's ok as we only have one chain
    chainId: STAKING_CHAIN_ID,
  };
};

export const getStakeConfirmationDialogData = (
  projects: ProjectData[],
  applicationsToStakeAmount: Record<string, number>,
) => {
  return projects
    .map((project) => ({
      name: project.name,
      stakeAmount: applicationsToStakeAmount[project.id],
    }))
    .filter((d) => !!d.stakeAmount);
};

export const getSortOptions = () => [
  {
    groupLabel: "Order By",
    items: [
      { label: "Total Staked", value: "totalStaked" },
      { label: "Total Donations", value: "totalDonations" },
      { label: "Contributors", value: "contributors" },
    ],
  },
];

export const getLeaderboardTitle = (sortOption: string): string => {
  const options = {
    totalStaked: "Total Staked",
    totalDonations: "Total Donations",
    contributors: "Contributors",
  };

  return `Leaderboard - ${options[sortOption as keyof typeof options] || "Total Staked"}`;
};

export const getRoundTimeInfo = (
  donationsEndTime: string | undefined,
  donationsStartTime: string | undefined,
) => {
  if (!donationsEndTime || !donationsStartTime) {
    return {
      isRoundOver: false,
      timeLeftMessage: "",
      daysLeft: 0,
    };
  }

  const now = moment();
  const startTime = moment(donationsStartTime);
  const endTime = moment(donationsEndTime);

  // Check if the round hasn't started yet
  if (now.isBefore(startTime)) {
    const diffInMs = startTime.diff(now);
    const duration = moment.duration(diffInMs);
    const days = Math.floor(duration.asDays());

    let timeLeftMessage;
    if (days > 0) {
      timeLeftMessage = `Staking starts in ${days} days`;
    } else {
      const hours = Math.floor(duration.asHours());
      if (hours > 0) {
        timeLeftMessage = `Staking starts in ${hours} hours`;
      } else {
        timeLeftMessage = `Staking starts in < 1 day`;
      }
    }

    return {
      isRoundOver: false,
      timeLeftMessage,
      daysLeft: days,
      hasStarted: false,
    };
  }

  // Round has started, check if it's over
  const isRoundOver = now.isAfter(endTime);

  let timeLeftMessage;
  let daysLeft = 0;

  if (isRoundOver) {
    timeLeftMessage = "Staking closed";
  } else {
    const diffInMs = endTime.diff(now);
    const duration = moment.duration(diffInMs);
    daysLeft = Math.floor(duration.asDays());

    if (daysLeft > 0) {
      timeLeftMessage = `${daysLeft} days left`;
    } else {
      timeLeftMessage = "< 1 day left";
    }
  }

  return {
    isRoundOver,
    timeLeftMessage,
    daysLeft,
    hasStarted: true,
  };
};
