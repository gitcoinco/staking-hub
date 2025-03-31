import {
  MerkleAirdrop,
  MerkleAirdrop_Claim,
  MerkleAirdrop_MerkleRootChanged,
  MerkleAirdrop_OwnershipTransferred,
  MerkleAirdrop_Clawback,
} from "generated";

MerkleAirdrop.Claim.handler(async ({ event, context }) => {
  const entity: MerkleAirdrop_Claim = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    claimant: event.params.claimant,
    amount: event.params.amount,
    chainId: event.params.chainId,
    poolId: event.params.poolId,
    transactionHash: event.transaction.hash,
    blockTimestamp: event.block.timestamp,
  };

  context.MerkleAirdrop_Claim.set(entity);
});
  
MerkleAirdrop.MerkleRootChanged.handler(async ({ event, context }) => {
  const entity: MerkleAirdrop_MerkleRootChanged = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    merkleRoot: event.params.merkleRoot,
  };

  context.MerkleAirdrop_MerkleRootChanged.set(entity);
});

MerkleAirdrop.OwnershipTransferred.handler(async ({ event, context }) => {
  const entity: MerkleAirdrop_OwnershipTransferred = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    previousOwner: event.params.previousOwner,
    newOwner: event.params.newOwner,
  };

  context.MerkleAirdrop_OwnershipTransferred.set(entity);
});

MerkleAirdrop.Clawback.handler(async ({ event, context }) => {
  const entity: MerkleAirdrop_Clawback = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    clawbackAddress: event.params.clawbackAddress,
    amount: event.params.amount,
    token: event.params.token,
  };

  context.MerkleAirdrop_Clawback.set(entity);
});