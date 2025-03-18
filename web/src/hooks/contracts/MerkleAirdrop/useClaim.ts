import { useEffect, useState } from "react";
import { TransactionData } from "@allo-team/allo-v2-sdk";
import { useToast } from "@gitcoin/ui/hooks/useToast";
import { ProgressStatus, Step } from "@gitcoin/ui/types";
import { Address, encodeFunctionData } from "viem";
import { useContractInteraction, ContractOperation } from "@/hooks";
import { abi as tokenLockAbi } from "@/hooks/contracts/TokenLock/abi";
import { getStakingContractsByChainId } from "@/services/web3/stakingConfig";
import { abi } from "./abi";

// Define the progress steps
const getClaimProgressSteps = ({
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
      description: "Completing the claim process...",
      status: finishingStatus,
    },
  ];
};

export interface ClaimParams {
  chainId: number;
  poolId: string;
  recipient: `0x${string}`;
  amount: bigint;
  merkleProof: `0x${string}`[];
  returnToMatchingPool: boolean;
  merkleAirdropAddress: string;
}

export const useClaim = () => {
  const { steps, contractInteractionMutation } = useContractInteraction();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (contractInteractionMutation.isSuccess) {
      toast({
        description: "Claim successful",
        status: "success",
      });
    }
    if (contractInteractionMutation.isError) {
      toast({
        description: "Claim failed",
        status: "error",
      });
    }
  }, [contractInteractionMutation.isSuccess, contractInteractionMutation.isError]);

  // For batch claiming multiple rewards at once
  const batchClaim = async (claimParams: ClaimParams[], totalUnstaked: bigint) => {
    setIsLoading(true);

    try {
      // Group by chainId since we need separate transactions for different chains
      const claimsByChain = claimParams.reduce(
        (acc, params) => {
          if (!acc[params.chainId]) {
            acc[params.chainId] = [];
          }
          acc[params.chainId].push(params);
          return acc;
        },
        {} as Record<number, ClaimParams[]>,
      );

      // Process each chain sequentially
      for (const [chainIdStr, chainClaims] of Object.entries(claimsByChain)) {
        const chainId = Number(chainIdStr);

        const transactionsData: TransactionData[] = [];

        // Prepare transaction data for each claim in this chain
        chainClaims.forEach((params) => {
          const claimData = encodeFunctionData({
            abi,
            functionName: "claimTokens",
            args: [
              params.recipient,
              params.amount,
              params.merkleProof,
              params.returnToMatchingPool,
            ],
          });

          transactionsData.push({
            to: params.merkleAirdropAddress as Address,
            data: claimData,
            value: "0",
          });
        });

        transactionsData.push({
          to: getStakingContractsByChainId(chainId)?.tokenLock as Address,
          data: encodeFunctionData({
            abi: tokenLockAbi,
            functionName: "claim",
            args: [claimParams[0].recipient, totalUnstaked],
          }),
          value: "0",
        });

        // Create contract operations for progress tracking
        const contractOperations = [];

        contractOperations.push(
          ...chainClaims.map((params, index) => ({
            type: "transaction" as const,
            order: index + 1,
            metadata: {
              name: params.returnToMatchingPool
                ? `Donating rewards for round #${index + 1}`
                : `Claiming rewards for round #${index + 1}`,
              description: params.returnToMatchingPool
                ? `Your staking rewards are being sent to the matching pool.`
                : `Your staking rewards are being claimed.`,
            },
          })),
        );

        contractOperations.push({
          type: "transaction" as const,
          order: contractOperations.length + 1,
          metadata: {
            name: "Unstaking GTC",
            description: "Your staked GTC is being withdrawn.",
          },
        });

        await contractInteractionMutation.mutateAsync({
          chainId,
          transactionsData: async () => transactionsData,
          getProgressSteps: getClaimProgressSteps,
          contractOperations,
          postIndexerHook: async (receipt) => {
            console.log("Batch claim transaction indexed:", receipt.transactionHash);
          },
        });
      }

      return true;
    } catch (error) {
      console.error("Error batch claiming rewards:", error);
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    batchClaim,
    steps,
    isLoading: isLoading || contractInteractionMutation.isPending,
    isError: contractInteractionMutation.isError,
    error: contractInteractionMutation.error,
    isSuccess: contractInteractionMutation.isSuccess,
    reset: contractInteractionMutation.reset,
  };
};
