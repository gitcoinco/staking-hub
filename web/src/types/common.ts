export interface PoolIdChainId {
  alloPoolId: string;
  chainId: number;
}

export interface PoolIdChainIdRecipient extends PoolIdChainId {
  recipient: string;
}