import { PoolOverview, RewardWithoutProof, RoundWithStakes, StakerOverview } from "@/types";

const GET = async (url: string) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error: ${response.status} - ${errorData.message || "Unknown error"}`);
  }

  return response.json();
}

// Pool Routes

export async function getPoolSummary(alloPoolId: string, chainId: number): Promise<RoundWithStakes> {
  try {
    let url = `${import.meta.env.VITE_STAKING_HUB_ENDPOINT}/api/pools/${chainId}/${alloPoolId}/summary`;
    const response: RoundWithStakes = await GET(url);
    return response;
  } catch (error) {
    console.error("Error fetching pool info and stakes:", error);
    throw error;
  }
}

export async function getAllPoolsOverview(): Promise<PoolOverview[]> {
  try {
    const url = `${import.meta.env.VITE_STAKING_HUB_ENDPOINT}/api/pools/overview`;
    const response: PoolOverview[] = await GET(url);
    return response;
  } catch (error) {
    console.error("Error fetching all pools overview:", error);
    throw error;
  }
}

// Recipient Routes

export async function getStakerOverview(stakerId: string): Promise<StakerOverview> {
  try {
    const url = `${import.meta.env.VITE_STAKING_HUB_ENDPOINT}/api/stakers/${stakerId}/overview`;
    const response: StakerOverview = await GET(url);
    return response;
  } catch (error) {
    console.error("Error fetching stakes for recipient:", error);
    throw error;
  }
}

type GetRewardsForStakerBody = {
  staker: string;
  signature: string;
  chainId?: number;
  alloPoolId?: string;
}

export async function getRewardsForStaker(getRewardsForStakerBody: GetRewardsForStakerBody): Promise<RewardWithoutProof[]> {

  const { staker, ...rewardsForStakerBody } = getRewardsForStakerBody;
  const url = `${import.meta.env.VITE_STAKING_HUB_ENDPOINT}/api/stakers/${staker}/rewards`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rewardsForStakerBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} - ${errorData.message || "Unknown error"}`);
    }

    const data = await response.json();
    return data.evaluationId;
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    throw error;
  }
}