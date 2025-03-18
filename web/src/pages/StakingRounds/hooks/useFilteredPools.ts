import { useMemo } from "react";
import { mapStatusToFilterValue } from "../utils/poolStatus";
import { StakePoolCardData } from "./usePoolsData";

export const useFilteredPools = (
  pools: StakePoolCardData[],
  searchTerm: string,
  selectedFilters: Record<string, string[]>,
  order: Record<string, string[]>,
) => {
  return useMemo(() => {
    let result = [...pools];

    // 1) Apply search filter
    if (searchTerm) {
      result = result.filter(
        (card) =>
          card.roundName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.roundDescription.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // 2) Check for "All" filter
    const ungrouped = selectedFilters["ungrouped"];
    const hasAllFilter = ungrouped?.includes("All");

    if (!hasAllFilter) {
      // 3) Filter by network
      const selectedNetworks = selectedFilters["Network"] || [];
      if (selectedNetworks.length > 0) {
        result = result.filter((card) => selectedNetworks.includes(card.chainId.toString()));
      }

      // 4) Filter by status
      const selectedStatuses = selectedFilters["Status"] || [];
      if (selectedStatuses.length > 0) {
        result = result.filter((card) => {
          // Map the pool status to the filter value
          const statusFilterValue = mapStatusToFilterValue(card.status);
          return selectedStatuses.includes(statusFilterValue);
        });
      }
    }

    // 5) Apply ordering
    const orderByTime = order["ORDER BY TIME"]?.[0];
    const orderByName = order["ORDER BY NAME"]?.[0];

    if (orderByTime === "Recent") {
      // Sort by start date descending (newest first)
      result.sort((a, b) => b.votingStartDate.getTime() - a.votingStartDate.getTime());
    } else if (orderByTime === "Oldest") {
      // Sort by start date ascending (oldest first)
      result.sort((a, b) => a.votingStartDate.getTime() - b.votingStartDate.getTime());
    } else if (orderByName === "A-Z") {
      result.sort((a, b) => a.roundName.localeCompare(b.roundName));
    } else if (orderByName === "Z-A") {
      result.sort((a, b) => b.roundName.localeCompare(a.roundName));
    }

    return result;
  }, [pools, searchTerm, selectedFilters, order]);
};
