import { useAccount, useBalance } from "wagmi";
import { useTokenPrice } from "@/hooks/tokens/useTokenPrice";
import { getStakingContractsByChainId } from "@/services/web3/stakingConfig";

export const useGTC = () => {
  const { address, chainId } = useAccount();

  const tokenAddress = getStakingContractsByChainId(chainId ?? 1)?.gtcToken;

  const { data: balance } = useBalance({
    address,
    token: tokenAddress,
    chainId,
  });

  const gtcRedstoneId = "GTC";
  const { data: price } = useTokenPrice(gtcRedstoneId);

  if (!tokenAddress) {
    return {
      formatted: "0",
      value: BigInt(0),
      decimals: 18,
      symbol: "GTC",
      displayValue: "0",
      chainId,
      price: price ?? 0,
    };
  }

  return {
    ...(balance ?? {
      formatted: "0",
      value: BigInt(0),
      decimals: 18,
      symbol: "GTC",
      displayValue: "0",
    }),
    chainId,
    price: price ?? 0,
  };
};
