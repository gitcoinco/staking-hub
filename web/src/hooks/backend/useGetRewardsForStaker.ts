import { getRewardsForStaker } from "@/services/backend";
import { useQuery } from "@tanstack/react-query";

export const useGetRewardsForStaker = (staker: string, signature: string, chainId?: number, alloPoolId?: string) => {

  const query = useQuery({
    queryKey: ['rewardsForStaker', staker, chainId, alloPoolId],
    queryFn: () => {
      if (chainId && alloPoolId) {
        return getRewardsForStaker({ staker, chainId, alloPoolId, signature });
      } else {
        return getRewardsForStaker({ staker, signature });
      }
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
