import { useNavigate } from "react-router-dom";
import { MultipleSelect } from "@gitcoin/ui/client";
import { StakePoolCard } from "@gitcoin/ui/pool";
import { LoadingPage } from "@/components/Loading";
import { useGetAllPoolsOverview } from "@/hooks/backend";
import { useFilteredPools } from "./hooks/useFilteredPools";
import { usePoolsData } from "./hooks/usePoolsData";
import { useStakingRoundsState } from "./hooks/useStakingRoundsState";
import { getSortFilterOptions } from "./utils/poolStatus";

export const StakingRounds = () => {
  const navigate = useNavigate();
  const { data: poolsOverview, isLoading } = useGetAllPoolsOverview();

  // Use custom hooks for state management
  const {
    searchTerm,
    order,
    selectedFilters,
    handleSearchChange,
    handleFilterChange,
    handleOrderChange,
  } = useStakingRoundsState();

  // Get pool data
  const stakePoolCards = usePoolsData(poolsOverview);

  // Get filtered and sorted pools
  const filteredAndOrderedPools = useFilteredPools(
    stakePoolCards,
    searchTerm,
    selectedFilters,
    order,
  );

  // Get filter and sort options
  const { orderOptions, filterOptions } = getSortFilterOptions(stakePoolCards);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!poolsOverview || poolsOverview.length === 0) {
    return <div>No pools overview found</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Custom Search bar */}
        <div className="flex-1">
          <div className="relative">
            <div className="outline-border-primary inline-flex w-[302px] items-center justify-start gap-4 rounded-3xl bg-white/50 px-4 py-2 outline outline-[1.22px] outline-offset-[-0.61px] backdrop-blur-[6.50px]">
              <div data-svg-wrapper>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 17L11.6667 11.6667M13.4444 7.22222C13.4444 10.6587 10.6587 13.4444 7.22222 13.4444C3.78578 13.4444 1 10.6587 1 7.22222C1 3.78578 3.78578 1 7.22222 1C10.6587 1 13.4444 3.78578 13.4444 7.22222Z"
                    stroke="#4B5050"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="text-text-secondary w-full border-none bg-transparent font-ui-mono text-sm font-medium leading-normal outline-none"
              />
            </div>
          </div>
        </div>

        {/* Filters and sorting */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="font-ui-sans text-body text-nowrap font-medium">Filter by</div>
            <MultipleSelect
              options={filterOptions}
              onChange={handleFilterChange}
              defaultValue={{ ungrouped: ["All"] }}
              className="w-64"
              variants={{
                triggerTextColor: "green",
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="font-ui-sans text-body text-nowrap font-medium">Order by</div>
            <MultipleSelect
              options={orderOptions}
              onChange={handleOrderChange}
              defaultValue={{ "ORDER BY TIME": ["Recent"] }}
              className="w-40"
              variants={{
                triggerTextColor: "green",
                itemsPosition: "end",
                headerPosition: "end",
              }}
            />
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-2 flex items-center justify-between">
        <div className="font-ui-sans text-2xl font-medium">
          Staking Rounds ({filteredAndOrderedPools.length})
        </div>
        {(searchTerm || !selectedFilters["ungrouped"]?.includes("All")) && (
          <div className="text-sm text-gray-500">
            Showing {filteredAndOrderedPools.length} of {stakePoolCards.length} rounds
          </div>
        )}
      </div>

      {/* Pool cards */}
      {filteredAndOrderedPools.length > 0 ? (
        filteredAndOrderedPools.map((card) => (
          <StakePoolCard
            key={`${card.chainId}-${card.roundId}`}
            data={{
              ...card,
              onClick: () => navigate(`/staking-round/${card.chainId}/${card.roundId}`),
            }}
          />
        ))
      ) : (
        <div className="py-4 text-center text-gray-500">
          {searchTerm || !selectedFilters["ungrouped"]?.includes("All")
            ? "No matching rounds found"
            : "No rounds available"}
        </div>
      )}
    </div>
  );
};
