import { type Hex } from 'viem';

export interface Signature {
  signature: Hex;
}
export interface PoolIdChainId {
  alloPoolId: string;
  chainId: number;
}

export interface PoolIdChainIdBody extends PoolIdChainId, Signature {}

export interface PoolIdChainIdApplicationId extends PoolIdChainId {
  alloApplicationId: string;
}

export interface PoolIdChainIdApplicationIdBody
  extends PoolIdChainIdApplicationId,
    Signature {}
