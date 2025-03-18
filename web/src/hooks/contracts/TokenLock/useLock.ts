import { useEffect, useState } from "react";
import { useToast } from "@gitcoin/ui/hooks/useToast";
import { ProgressStatus, Step } from "@gitcoin/ui/types";
import { Address, encodeFunctionData } from "viem";
import { erc20Abi } from "viem";
import { useContractInteraction, ContractOperation } from "@/hooks";
import { getStakingContractsByChainId } from "@/services/web3/stakingConfig";
import { abi } from "./abi";

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
      description: "Your stake is being registered on the blockchain.",
      status: indexingStatus,
    },
    {
      name: "Finishing up",
      description: "We’re wrapping up.",
      status: finishingStatus,
    },
  ];
};

export const useLock = () => {
  const { steps, contractInteractionMutation } = useContractInteraction();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (contractInteractionMutation.isSuccess) {
      toast({
        title: "Tokens locked",
        description: "Your tokens have been locked",
        status: "success",
      });
    }
    if (contractInteractionMutation.isError) {
      toast({
        title: "Error locking tokens",
        description: "Your tokens have not been locked",
        status: "error",
      });
    }
  }, [contractInteractionMutation.isSuccess, contractInteractionMutation.isError]);
  const lock = async ({
    chainId,
    amounts,
    recipientIds,
    chainIds = [BigInt(chainId)],
    poolIds = [BigInt(1)],
  }: {
    chainId: number;
    amounts: bigint[];
    recipientIds: Address[];
    chainIds?: bigint[];
    poolIds?: bigint[];
  }) => {
    const stakingContracts = getStakingContractsByChainId(chainId);
    const tokenLockAddress = stakingContracts?.tokenLock;
    const gtcTokenAddress = stakingContracts?.gtcToken;
    setIsLoading(true);

    if (!tokenLockAddress || !gtcTokenAddress) {
      throw new Error("Staking contracts not found");
    }
    try {
      // Convert amount to wei (assuming 18 decimals)
      const amountInWei = amounts.reduce((acc, amount) => acc + amount, BigInt(0));

      // Prepare transaction data
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [tokenLockAddress, amountInWei],
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

      const recipientsLength = recipientIds.length;

      const lockTokensDescription = `Your GTC is being staked across ${recipientsLength} ${
        recipientsLength === 1 ? "project" : "projects"
      }`;

      await contractInteractionMutation.mutateAsync({
        chainId,
        transactionsData: async () => [
          {
            to: gtcTokenAddress,
            data: approveData,
            value: "0",
          },
          {
            to: tokenLockAddress,
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
              name: "Approving tokens",
              description: "Your wallet is approving GTC for staking.",
            },
          },
          {
            type: "transaction",
            order: 2,
            metadata: {
              name: "Locking tokens",
              description: lockTokensDescription,
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
