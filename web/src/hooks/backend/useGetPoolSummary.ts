import { getPoolSummary } from "@/services/backend";
import { useQuery } from "@tanstack/react-query";

export const useGetPoolSummaries = (alloPoolId: string, chainId: string) => {

  const query = useQuery({
    queryKey: ['poolSummary', alloPoolId, chainId],
    queryFn: () => getPoolSummary(alloPoolId, Number(chainId)),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}