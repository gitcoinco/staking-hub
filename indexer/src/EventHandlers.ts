/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  MerkleAirdrop,
  MerkleAirdrop_Claim,
  MerkleAirdrop_MerkleRootChanged,
  MerkleAirdrop_OwnershipTransferred,
  TokenLock,
  TokenLock_Claimed,
  TokenLock_Locked,
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

TokenLock.Claimed.handler(async ({ event, context }) => {
  const entity: TokenLock_Claimed = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    owner: event.params.owner,
    recipient: event.params.recipient,
    amount: event.params.amount,
  };

  context.TokenLock_Claimed.set(entity);
});

TokenLock.Locked.handler(async ({ event, context }) => {
  const entity: TokenLock_Locked = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    sender: event.params.sender,
    recipient: event.params.recipient,
    amount: event.params.amount,
  };

  context.TokenLock_Locked.set(entity);
});
