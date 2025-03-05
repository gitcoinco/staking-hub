import { PoolIdChainId, PoolIdChainIdRecipient, RewardWithoutProof, RoundWithStakes, Stake } from "@/types";

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
export async function getPoolRewardsByAlloPoolIdAndChainId(poolRewardsBody: PoolIdChainId): Promise<RewardWithoutProof[]> {
  try {
    const url = `${import.meta.env.VITE_STAKING_HUB_ENDPOINT}/api/pools/${poolRewardsBody.chainId}/${poolRewardsBody.alloPoolId}/rewards`;
    const response: RewardWithoutProof[] = await GET(url);
    return response;
  } catch (error) {
    console.error("Error fetching pool rewards:", error);
    throw error;
  }
}

export async function getPoolRewardByAlloPoolIdAndChainIdAndRecipient(poolRewardsBody: PoolIdChainIdRecipient): Promise<RewardWithoutProof> {
  try {
    const url = `${import.meta.env.VITE_STAKING_HUB_ENDPOINT}/api/pools/${poolRewardsBody.chainId}/${poolRewardsBody.alloPoolId}/rewards?recipient=${poolRewardsBody.recipient}`;
    const response: RewardWithoutProof[] = await GET(url);
    return response[0];
  } catch (error) {
    console.error("Error fetching pool reward for recipient:", error);
    throw error;
  }
}

export async function getPoolInfoAndStakesByAlloPoolIdAndChainId(poolInfoAndStakesBody: PoolIdChainId): Promise<RoundWithStakes> {
  try {
    const url = `${import.meta.env.VITE_STAKING_HUB_ENDPOINT}/api/pools/${poolInfoAndStakesBody.chainId}/${poolInfoAndStakesBody.alloPoolId}/stakes`;
    const response: RoundWithStakes = await GET(url);
    return response;
  } catch (error) {
    console.error("Error fetching pool info and stakes:", error);
    throw error;
  }
}

// Recipient Routes
export async function getStakesForRecipient(recipientId: string): Promise<Stake[]> {
  try {
    const url = `${import.meta.env.VITE_STAKING_HUB_ENDPOINT}/api/recipients/${recipientId}/stakes`;
    const response: Stake[] = await GET(url);
    return response;
  } catch (error) {
    console.error("Error fetching stakes for recipient:", error);
    throw error;
  }
}

type GetRewardsForRecipientBody = {
  recipientId: string;
  signature: string;
  chainId?: number;
  alloPoolId?: string;
}

export async function getRewardsForRecipient(getRewardsForRecipientBody: GetRewardsForRecipientBody): Promise<RewardWithoutProof[]> {

  const { recipientId, ...rewardsForRecipientBody } = getRewardsForRecipientBody;
  const url = `${import.meta.env.VITE_STAKING_HUB_ENDPOINT}/api/recipients/${recipientId}/rewards`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rewardsForRecipientBody),
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