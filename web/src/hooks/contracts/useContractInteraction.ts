import { useState, useEffect, useMemo, useRef } from "react";
import { TransactionData } from "@allo-team/allo-v2-sdk";
import { ProgressStatus, Step } from "@gitcoin/ui/types";
import { useMutation } from "@tanstack/react-query";
import { createPublicClient, http, TransactionReceipt } from "viem";
import { useWalletClient } from "wagmi";
import { waitUntilIndexerSynced } from "@/services/indexer/waitUntilIndexerSynced";
import { targetNetworks } from "@/services/web3/chains";

// Define operation with order
export interface ContractOperation {
  type: "transaction" | "signing" | "approval";
  order: number; // Order in which the operation should be executed
  metadata: {
    name: string;
    description: string;
  };
}

// Maintain the original interface for backward compatibility
interface GetProgressSteps {
  (args: {
    indexingStatus: ProgressStatus;
    finishingStatus: ProgressStatus;
    contractOperations: ContractOperation[];
    contractOperationStatuses: ProgressStatus[];
  }): Step[];
}

export const useContractInteraction = () => {
  // State for operation statuses
  const [contractOperationStatuses, setContractOperationStatuses] = useState<ProgressStatus[]>([]);
  const [indexingStatus, setIndexingStatus] = useState<ProgressStatus>(ProgressStatus.NOT_STARTED);
  const [finishingStatus, setFinishingStatus] = useState<ProgressStatus>(
    ProgressStatus.NOT_STARTED,
  );

  const [steps, setSteps] = useState<Step[]>([]);
  const { data: walletClient } = useWalletClient();
  const getProgressStepsRef = useRef<GetProgressSteps | null>(null);
  const contractOperationsRef = useRef<ContractOperation[]>([]);

  // Update steps when statuses change
  useMemo(() => {
    if (getProgressStepsRef.current) {
      setSteps(
        getProgressStepsRef.current({
          indexingStatus,
          finishingStatus,
          contractOperations: contractOperationsRef.current,
          contractOperationStatuses: contractOperationStatuses,
        }),
      );
    }
  }, [contractOperationStatuses, indexingStatus, finishingStatus]);

  const contractInteractionMutation = useMutation({
    mutationFn: async ({
      chainId,
      transactionsData,
      getProgressSteps,
      contractOperations,
      postIndexerHook,
    }: {
      chainId: number;
      transactionsData: () => Promise<(TransactionData & { skip?: boolean })[]>;
      getProgressSteps: GetProgressSteps;
      contractOperations: ContractOperation[];
      postIndexerHook?: (receipt: TransactionReceipt) => Promise<void>;
    }) => {
      if (!walletClient) {
        throw new Error("WalletClient is undefined");
      }

      if (walletClient.chain.id !== chainId) {
        await walletClient.switchChain({ id: chainId });
      }

      const account = walletClient.account;
      if (!account) {
        throw new Error("WalletClient account is undefined");
      }

      // Store the getProgressSteps function and operations
      getProgressStepsRef.current = getProgressSteps;

      // Sort operations by order
      const sortedOperations = [...contractOperations].sort((a, b) => a.order - b.order);
      contractOperationsRef.current = sortedOperations;

      const chain = targetNetworks.find((chain) => chain.id === chainId);
      const publicClient = createPublicClient({
        chain,
        transport: http(),
      });

      const txDatas = await transactionsData();

      // Create a mapping from operation index to transaction data index
      // This ensures we execute transactions in the correct order
      const operationToTxMap = new Map<number, number>();
      let txIndex = 0;

      for (let i = 0; i < sortedOperations.length; i++) {
        if (sortedOperations[i].type === "transaction" && txIndex < txDatas.length) {
          operationToTxMap.set(i, txIndex);
          txIndex++;
        }
      }

      // Initialize statuses for all operations
      setContractOperationStatuses(Array(sortedOperations.length).fill(ProgressStatus.NOT_STARTED));

      // Process each operation in order
      let receipt: TransactionReceipt | undefined;
      let lastTxData: (TransactionData & { skip?: boolean }) | undefined;

      for (let opIndex = 0; opIndex < sortedOperations.length; opIndex++) {
        const operation = sortedOperations[opIndex];

        // Update status to IN_PROGRESS
        setContractOperationStatuses((prev) => {
          const newStatuses = [...prev];
          newStatuses[opIndex] = ProgressStatus.IN_PROGRESS;
          return newStatuses;
        });

        // Only process transaction operations
        if (operation.type === "transaction") {
          const txDataIndex = operationToTxMap.get(opIndex);

          if (txDataIndex === undefined || txDataIndex >= txDatas.length) {
            setContractOperationStatuses((prev) => {
              const newStatuses = [...prev];
              newStatuses[opIndex] = ProgressStatus.IS_ERROR;
              return newStatuses;
            });
            throw new Error("Transaction data not found for operation");
          }

          const txData = txDatas[txDataIndex];
          lastTxData = txData; // Keep track of the last transaction for skip logic

          try {
            const txHash = await walletClient.sendTransaction({
              account,
              to: txData.to,
              data: txData.data,
              value: BigInt(txData.value),
              chain,
            });

            receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

            if (!receipt.status || receipt.status === "reverted") {
              setContractOperationStatuses((prev) => {
                const newStatuses = [...prev];
                newStatuses[opIndex] = ProgressStatus.IS_ERROR;
                return newStatuses;
              });
              throw new Error("Transaction failed");
            }

            // Update status to SUCCESS
            setContractOperationStatuses((prev) => {
              const newStatuses = [...prev];
              newStatuses[opIndex] = ProgressStatus.IS_SUCCESS;
              return newStatuses;
            });
          } catch (e) {
            setContractOperationStatuses((prev) => {
              const newStatuses = [...prev];
              newStatuses[opIndex] = ProgressStatus.IS_ERROR;
              return newStatuses;
            });
            throw new Error("Failed to send transaction");
          }
        }
        // For non-transaction operations, just mark as success
        // In a real implementation, you would handle these differently
        else {
          // Simulate some processing time
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Update status to SUCCESS
          setContractOperationStatuses((prev) => {
            const newStatuses = [...prev];
            newStatuses[opIndex] = ProgressStatus.IS_SUCCESS;
            return newStatuses;
          });
        }
      }

      // Only run indexing if the last transaction wasn't skipped
      if (lastTxData && !lastTxData.skip) {
        setIndexingStatus(ProgressStatus.IN_PROGRESS);

        try {
          if (receipt) {
            await waitUntilIndexerSynced({
              chainId,
              blockNumber: receipt.blockNumber,
            });
          } else {
            await new Promise((resolve) => setTimeout(resolve, 10000));
          }

          if (postIndexerHook && receipt) {
            await postIndexerHook(receipt);
          }

          setIndexingStatus(ProgressStatus.IS_SUCCESS);
        } catch (e) {
          setIndexingStatus(ProgressStatus.IS_ERROR);
          throw new Error("Failed to sync with indexer");
        }
      }

      setFinishingStatus(ProgressStatus.IN_PROGRESS);
      setFinishingStatus(ProgressStatus.IS_SUCCESS);
    },
  });

  // Reset states when mutation completes
  useEffect(() => {
    if (contractInteractionMutation.isSuccess) {
      setContractOperationStatuses([]);
      setIndexingStatus(ProgressStatus.NOT_STARTED);
      setFinishingStatus(ProgressStatus.NOT_STARTED);
      contractOperationsRef.current = [];
      contractInteractionMutation.reset();
    }
  }, [contractInteractionMutation]);

  return {
    steps,
    contractInteractionMutation,
  };
};
