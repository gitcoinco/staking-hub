import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export const useStakingRoundsState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  // State for filters and sorting
  const [order, setOrder] = useState<Record<string, string[]>>({
    "ORDER BY TIME": ["Recent"],
  });

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    ungrouped: ["All"], // Start with "All" selected
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  // Handle filter change
  const handleFilterChange = (values: Record<string, string[]>) => {
    setSelectedFilters(values);
  };

  // Handle order change
  const handleOrderChange = (values: Record<string, string[]>) => {
    setOrder(values);
  };

  return {
    searchTerm,
    order,
    selectedFilters,
    handleSearchChange,
    handleFilterChange,
    handleOrderChange,
  };
};
