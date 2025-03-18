import { getAddress } from "viem";
import { RoundWithStakes } from "@/types/backend";

/**
 * Calculate stake information for a specific staker and anchor address
 * @param stakes Array of stake data
 * @param stakerAddress Address of the staker
 * @param anchorAddress Anchor address to check stakes for
 * @returns Object containing amount and stakedAt, or undefined if no stakes found
 */
export const calculateStakeInfo = (
  stakes: RoundWithStakes["stakes"],
  stakerAddress: string,
  anchorAddress: string,
) => {
  try {
    if (!stakerAddress || !anchorAddress) return undefined;

    // Normalize addresses for comparison
    const normalizedStaker = getAddress(stakerAddress);
    const normalizedAnchor = getAddress(anchorAddress);

    // Filter stakes for this staker and anchor address
    const relevantStakes = stakes.filter(
      (s) =>
        getAddress(s.recipient) === normalizedAnchor && getAddress(s.sender) === normalizedStaker,
    );

    // If no stakes found, return undefined
    if (relevantStakes.length === 0) {
      return undefined;
    }

    // Calculate total staked amount
    const totalAmount = relevantStakes
      .map((s) => s.amount)
      .reduce((a, b) => BigInt(a) + BigInt(b), BigInt(0));

    // If total amount is 0, return undefined
    if (totalAmount === BigInt(0)) {
      return undefined;
    }

    // Find the earliest stake timestamp
    const timestamps = relevantStakes.map((s) => Number(s.blockTimestamp));
    const earliestTimestamp = Math.min(...timestamps);

    return {
      amount: Number(totalAmount) / 1e18,
      stakedAt: new Date(earliestTimestamp * 1000),
    };
  } catch (error) {
    console.error("Error calculating stake info:", error);
    return undefined;
  }
};
