import { getTokensByChainId } from "@gitcoin/gitcoin-chain-data";
import { useQuery } from "@tanstack/react-query";
import { getAddress } from "viem";

export async function getTokenPrice(tokenId: string): Promise<number> {
  const tokenPriceEndpoint = `https://api.redstone.finance/prices?symbol=${tokenId}&provider=redstone&limit=1`;
  const resp = await fetch(tokenPriceEndpoint);
  const data = await resp.json();
  return data[0].value;
}

export const useTokenPrice = (redstoneId: string) => {
  const query = useQuery({
    queryKey: ["tokenPrice", redstoneId],
    queryFn: () => getTokenPrice(redstoneId),
  });

  return query;
};

export const getTokenData = async (chainId: number, tokenAddress: string) => {
  // Get token information
  const nativePayoutToken = getTokensByChainId(Number(chainId)).find(
    (t) => t.address === getAddress(tokenAddress),
  );

  const tokenData = {
    ...nativePayoutToken,
    symbol: nativePayoutToken?.code ?? "ETH",
  };
  const symbol = tokenData.symbol;

  const isStableCoin = symbol === "USDC" || symbol === "USDT" || symbol === "DAI";

  const tokenPrice = await getTokenPrice(tokenData.redstoneTokenId ?? "");

  return {
    ...tokenData,
    price: isStableCoin ? 1 : isNaN(tokenPrice) ? 0 : tokenPrice,
  };
};

export const useGetTokenData = (chainId: number, tokenAddress: string) => {
  const query = useQuery({
    queryKey: ["tokenData", chainId, tokenAddress],
    queryFn: () => getTokenData(chainId, tokenAddress),
  });

  return query;
};

interface GetRewardAmountInUSDProps {
  rewardsAmount: number;
  tokenAddress: string;
  chainId: number;
}

export const getRewardsAmountInUSD = async (data?: GetRewardAmountInUSDProps[]) => {
  if (!data) return 0;
  const rewardsAmountInUSD: number[] = [];
  for (const { rewardsAmount, tokenAddress, chainId } of data) {
    const tokenData = await getTokenData(chainId, tokenAddress);
    const tokenPrice = tokenData.price;
    const rewardAmountInUSD =
      (Number(rewardsAmount) / 10 ** (tokenData.decimals ?? 18)) * tokenPrice;
    rewardsAmountInUSD.push(rewardAmountInUSD);
  }
  return rewardsAmountInUSD.reduce((acc, curr) => acc + curr, 0);
};

export const useGetRewardsAmountInUSD = (data?: GetRewardAmountInUSDProps[]) => {
  const query = useQuery({
    queryKey: ["rewardsAmountInUSD", data],
    queryFn: () => getRewardsAmountInUSD(data),
  });
  return query;
};
