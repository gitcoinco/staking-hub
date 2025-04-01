import { Address } from "viem";

export const STAKING_CHAIN_ID = 1;

export const getStakingContractsByChainId = (
  chainId: number,
):
  | {
      tokenLock: Address;
      gtcToken: Address;
    }
  | undefined => {
  switch (chainId) {
    case 1:
      return {
        tokenLock: "0x73d7439cA441da0bED1020a1F1C88bD572f3D57c",
        gtcToken: "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F",
      };
    case 11155111:
      return {
        tokenLock: "0x006384dE9D80C04bF908495676C507EFfF5C7AD2",
        gtcToken: "0x5e7C95EaF08D6FeD05a8E4BC607Fb682834C74cE",
      };
    default:
      return undefined;
  }
};
