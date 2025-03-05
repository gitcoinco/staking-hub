import { getAllPoolsOverview } from "@/services/backend";
import { useQuery } from "@tanstack/react-query";

export const useGetAllPoolsOverview = () => {
  const query = useQuery({
    queryKey: ['allPoolsOverview'],
    queryFn: () => getAllPoolsOverview(),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
