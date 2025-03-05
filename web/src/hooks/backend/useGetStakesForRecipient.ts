import { getStakesForRecipient } from "@/services/backend";
import { useQuery } from "@tanstack/react-query";
export const useGetStakesForRecipient = (recipientId: string) => {

  const query = useQuery({
    queryKey: ['stakesForRecipient', recipientId],
    queryFn: () => getStakesForRecipient(recipientId),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
