import { getRewardsForRecipient } from "@/services/backend";
import { useQuery } from "@tanstack/react-query";

export const useGetRewardsForRecipient = (recipientId: string, signature: string, chainId?: number, alloPoolId?: string) => {

  const query = useQuery({
    queryKey: ['rewardsForRecipient', recipientId, signature, chainId, alloPoolId],
    queryFn: () => {
      if (chainId && alloPoolId) {
        return getRewardsForRecipient({ recipientId, signature, chainId, alloPoolId });
      } else {
        return getRewardsForRecipient({ recipientId, signature });
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
