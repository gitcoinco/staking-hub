import {
  MerkleAirdrop,
  MerkleAirdrop_Claim,
  MerkleAirdrop_MerkleRootChanged,
  MerkleAirdrop_OwnershipTransferred,
} from "generated";

MerkleAirdrop.Claim.handler(async ({ event, context }) => {
  const entity: MerkleAirdrop_Claim = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    claimant: event.params.claimant,
    amount: event.params.amount,
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