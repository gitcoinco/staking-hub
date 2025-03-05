import { getPoolInfoAndStakesByAlloPoolIdAndChainId } from "@/services/backend";
import { useQuery } from "@tanstack/react-query";

export const useGetPoolInfoAndStakes = (alloPoolId: string, chainId: number) => {

  const query = useQuery({
    queryKey: ['poolInfoAndStakes', alloPoolId, chainId],
    queryFn: () => getPoolInfoAndStakesByAlloPoolIdAndChainId({ alloPoolId, chainId }),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}