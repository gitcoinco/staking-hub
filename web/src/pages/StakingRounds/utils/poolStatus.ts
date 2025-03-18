import { MultipleSelectGroup } from "@gitcoin/ui/client";
import { getChainInfo } from "@gitcoin/ui/lib";
import { StakePoolCardData } from "@/pages/StakingRounds/hooks/usePoolsData";

// Define pool status enum
export enum PoolStatus {
  Upcoming = "upcoming",
  Active = "active",
  Ended = "ended",
}

// Helper function to determine pool status based on donation times
export const getPoolStatus = (startTime: Date, endTime: Date): PoolStatus => {
  const now = new Date();

  if (now < startTime) return PoolStatus.Upcoming;
  if (now > endTime) return PoolStatus.Ended;
  return PoolStatus.Active;
};

// Helper function to map pool status to filter value
export const mapStatusToFilterValue = (status: PoolStatus): string => {
  switch (status) {
    case PoolStatus.Active:
      return "active";
    case PoolStatus.Upcoming:
      return "applications"; // Assuming upcoming = taking applications
    case PoolStatus.Ended:
      return "finished";
    default:
      return "";
  }
};

// Helper function to get filter and sort options
export const getSortFilterOptions = (pools: StakePoolCardData[]) => {
  const orderOptions = [
    {
      groupLabel: "ORDER BY TIME",
      multiple: false,
      items: ["Recent", "Oldest"].map((value) => ({
        label: value,
        value,
        exclusive: true,
        exclusiveScope: "global",
      })),
    },
    {
      groupLabel: "ORDER BY NAME",
      multiple: false,
      items: ["A-Z", "Z-A"].map((value) => ({
        label: value,
        value,
        exclusive: true,
        exclusiveScope: "global",
      })),
    },
  ] satisfies MultipleSelectGroup[];

  // Example "All" ungrouped + networks + statuses
  const filterOptions = [
    {
      multiple: false,
      items: [
        {
          label: "All",
          value: "All",
          exclusive: true,
          exclusiveScope: "global",
        },
      ],
    },
    {
      groupLabel: "Network",
      multiple: true,
      collapsible: true,
      items: [...new Set(pools.map((pool) => pool.chainId))].map((chainId) => {
        const chainInfo = getChainInfo(chainId);
        return {
          label: `Rounds on ${chainInfo.name}`,
          value: chainId.toString(),
        };
      }),
    },
    {
      groupLabel: "Status",
      multiple: true,
      collapsible: true,
      items: [
        {
          label: "Active",
          value: "active",
        },
        {
          label: "Upcoming",
          value: "applications",
        },
        {
          label: "Finished",
          value: "finished",
        },
      ],
    },
  ] satisfies MultipleSelectGroup[];

  return { orderOptions, filterOptions };
};
