import { getStakerOverview } from "@/services/backend";
import { useQuery } from "@tanstack/react-query";

export const useGetStakerOverview = (stakerId: string) => {

  const query = useQuery({
    queryKey: ['stakerOverview', stakerId],
    queryFn: () => getStakerOverview(stakerId),
  });

  return query;
};