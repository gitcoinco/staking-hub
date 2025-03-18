import { env } from "@/env";

export const claimableRounds =
env.ROUNDS_WITH_MERKLE_AIRDROP_CONTRACTS?.split(',').map(round => {
  const [roundId, chainId, merkleAirdropAddress] = round.split(':');
  return { roundId, chainId, merkleAirdropAddress };
}) || [];

export const getMerkleAirdrop = (roundId: string, chainId: string) => {
  const round = claimableRounds.find(round => round.roundId === roundId && round.chainId === chainId);
  return round?.merkleAirdropAddress;
};
