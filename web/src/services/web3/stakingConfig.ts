import { Address } from "viem";

export const getStakingContractsByChainId = (
  chainId: number,
):
  | {
      tokenLock: Address;
      gtcToken: Address;
    }
  | undefined => {
  switch (chainId) {
    case 11155111:
      return {
        tokenLock: "0x006384dE9D80C04bF908495676C507EFfF5C7AD2",
        gtcToken: "0x5e7C95EaF08D6FeD05a8E4BC607Fb682834C74cE",
      };
    default:
      return undefined;
  }
};
