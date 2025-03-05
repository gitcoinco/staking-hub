import { getPoolRewardByAlloPoolIdAndChainIdAndRecipientId } from "@/services/backend";
import { useQuery } from "@tanstack/react-query";

export const useGetPoolRewards = (alloPoolId: string, chainId: number, recipientId?: string) => {  

  const query = useQuery({
    queryKey: ["poolRewards", alloPoolId, chainId, recipientId],
    queryFn: async () => await getPoolRewardByAlloPoolIdAndChainIdAndRecipientId(
      alloPoolId,
      chainId,
      recipientId
    ),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};
