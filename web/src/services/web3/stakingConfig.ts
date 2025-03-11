import { Hex } from "viem";

export const getStakingContractByChainId = (chainId: number): Hex | undefined => {
    switch (chainId) {
        case 11155111:
            return "0x5e7C95EaF08D6FeD05a8E4BC607Fb682834C74cE";
        default:
            return undefined;
    }
}