export const waitUntilIndexerSynced = async ({
  chainId,
  blockNumber,
}: {
  chainId: number;
  blockNumber: bigint;
}) => {
  const endpoint = `${import.meta.env.VITE_STAKING_INDEXER_URL}/graphql`;
  const pollIntervalInMs = 1000;

  async function pollIndexer() {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
            query getBlockNumberQuery($chainId: Int!) {
              event_sync_state(where: {chain_id: {_eq: $chainId}}) {
                block_timestamp
                block_number
                chain_id
              }
            }
          `,
        variables: {
          chainId,
        },
      }),
    });

    if (response.status === 200) {
      const {
        data,
      }: {
        data: {
          event_sync_state: { block_number: bigint }[];
        };
      } = await response.json();

      const subscriptions = data?.event_sync_state || [];

      if (subscriptions.length > 0) {
        const currentBlockNumber = BigInt(
          subscriptions.reduce(
            (minBlock, sub) =>
              BigInt(sub.block_number) < BigInt(minBlock) ? sub.block_number : minBlock,
            subscriptions[0].block_number,
          ),
        );

        if (currentBlockNumber >= blockNumber) {
          return true;
        }
      }
    }

    return false;
  }

  while (!(await pollIndexer())) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalInMs));
  }
};
