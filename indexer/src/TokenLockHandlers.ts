/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  TokenLock,
  TokenLock_Claimed,
  TokenLock_Locked,
} from "generated";

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
    sender: event.params.owner,
    chainId: event.params.chainId,
    poolId: event.params.poolId,
    recipient: event.params.recipientId,
    amount: event.params.amount,
    blockTimestamp: event.block.timestamp,
  };

  context.TokenLock_Locked.set(entity);
});
