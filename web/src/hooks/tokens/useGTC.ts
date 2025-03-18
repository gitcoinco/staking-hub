import { getChainById } from "@gitcoin/gitcoin-chain-data";
import { useAccount, useBalance } from "wagmi";
import { useTokenPrice } from "@/hooks/tokens/useTokenPrice";

export const useGTC = () => {
  const { address, chainId } = useAccount();

  const gtcToken = getChainById(chainId ?? 1).tokens.find((t) => t.code.toLowerCase() == "gtc");

  const tokenAddress =
    chainId === 11155111 ? "0x5e7C95EaF08D6FeD05a8E4BC607Fb682834C74cE" : gtcToken?.address;

  const { data: balance } = useBalance({
    address,
    token: tokenAddress,
    chainId,
  });

  const { data: price } = useTokenPrice("GTC");

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
