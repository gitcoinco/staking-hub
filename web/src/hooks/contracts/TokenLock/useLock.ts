import { useState } from "react";
import { ProgressStatus, Step } from "@gitcoin/ui/types";
import { encodeFunctionData } from "viem";
import { erc20Abi } from "viem";
import { useContractInteraction } from "../useContractInteraction";
import { abi } from "./abi";

// Dummy addresses for now
const TOKEN_ADDRESS = "0x5e7C95EaF08D6FeD05a8E4BC607Fb682834C74cE" as const;
const LOCK_CONTRACT_ADDRESS = "0x9324bC7A3aDFC19A40E790eCeFf9e46009df5587" as const;

export interface ContractOperation {
  type: "transaction" | "signing" | "approval";
  order: number; // Order in which the operation should be executed
  metadata: {
    name: string;
    description: string;
  };
}

// Define the progress steps
const getLockProgressSteps = ({
  indexingStatus,
  finishingStatus,
  contractOperations = [],
  contractOperationStatuses = [],
}: {
  indexingStatus: ProgressStatus;
  finishingStatus: ProgressStatus;
  contractOperations: ContractOperation[];
  contractOperationStatuses: ProgressStatus[];
}): Step[] => {
  // Generate steps based on operations
  const operationSteps = contractOperationStatuses.map((status, index) => {
    const operation = contractOperations[index];

    return {
      name: operation.metadata?.name,
      description: operation.metadata?.description,
      status,
    };
  });

  return [
    ...operationSteps,
    {
      name: "Indexing",
      description: "Syncing with the blockchain...",
      status: indexingStatus,
    },
    {
      name: "Finishing",
      description: "Completing the lock process...",
      status: finishingStatus,
    },
  ];
};

export const useLock = () => {
  const { steps, contractInteractionMutation } = useContractInteraction();
  const [isLoading, setIsLoading] = useState(false);

  const lock = async ({
    chainId,
    amounts,
    recipientIds,
    chainIds = [BigInt(chainId)],
    poolIds = [BigInt(1)],
  }: {
    chainId: number;
    amounts: bigint[];
    recipientIds: `0x${string}`[];
    chainIds?: bigint[];
    poolIds?: bigint[];
  }) => {
    setIsLoading(true);

    try {
      // Convert amount to wei (assuming 18 decimals)
      const amountInWei = amounts.reduce((acc, amount) => acc + amount, BigInt(0));

      // Prepare transaction data
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [LOCK_CONTRACT_ADDRESS, amountInWei],
      });

      const lockData = encodeFunctionData({
        abi,
        functionName: "lock",
        args: [
          amounts, // amount array
          chainIds, // chainId array
          poolIds, // poolId array
          recipientIds, // recipientId array
        ],
      });

      await contractInteractionMutation.mutateAsync({
        chainId,
        transactionsData: async () => [
          {
            to: TOKEN_ADDRESS,
            data: approveData,
            value: "0",
          },
          {
            to: LOCK_CONTRACT_ADDRESS,
            data: lockData,
            value: "0",
          },
        ],
        getProgressSteps: getLockProgressSteps,
        contractOperations: [
          {
            type: "transaction",
            order: 1,
            metadata: {
              name: "Approve Tokens",
              description: "Approving tokens for stacking",
            },
          },
          {
            type: "transaction",
            order: 2,
            metadata: {
              name: "Lock Tokens",
              description: `Staking tokens for ${recipientIds.length} recipients in ${chainIds.length} chains and ${poolIds.length} pools`,
            },
          },
        ],
        postIndexerHook: async (receipt) => {
          // In a real implementation, you might want to wait for indexer to sync
          // or perform additional operations after the transaction is indexed
          console.log("Transaction indexed:", receipt.transactionHash);
        },
      });

      return true;
    } catch (error) {
      console.error("Error locking tokens:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    lock,
    steps,
    isLoading: isLoading || contractInteractionMutation.isPending,
    isError: contractInteractionMutation.isError,
    error: contractInteractionMutation.error,
    isSuccess: contractInteractionMutation.isSuccess,
    reset: contractInteractionMutation.reset,
  };
};
