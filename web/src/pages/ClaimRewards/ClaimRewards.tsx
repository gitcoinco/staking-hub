import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ProgressModal } from "@gitcoin/ui";
import { cn } from "@gitcoin/ui/lib";
import { StakePoolCard } from "@gitcoin/ui/pool";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { LoadingPage } from "@/components/Loading";
import { useGetStakerOverview } from "@/hooks/backend";
import { useClaim } from "@/hooks/contracts";
import { useGetRewardsAmountInUSD } from "@/hooks/tokens";
import { ClaimConfirmationDialog } from "./components";
import {
  getClaimableRewardsInUSDParams,
  prepareClaimData,
  processRewardsData,
} from "./utils/claimRewards";

export const ClaimRewards = () => {
  const { address } = useAccount();
  const navigate = useNavigate();
  const { batchClaim, isLoading: isClaimLoading, steps } = useClaim(); // Assuming you have this hook

  const { data: stakeOverview, isLoading, refetch } = useGetStakerOverview(address ?? zeroAddress);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const { data: rewardsAmountInUSD, isLoading: isRewardsAmountInUSDLoading } =
    useGetRewardsAmountInUSD(getClaimableRewardsInUSDParams(stakeOverview));

  if (
    isLoading ||
    isRewardsAmountInUSDLoading ||
    !stakeOverview ||
    rewardsAmountInUSD === undefined
  ) {
    return <LoadingPage />;
  }

  const handleToggleConfirmationDialog = () => {
    setIsConfirmationDialogOpen(!isConfirmationDialogOpen);
  };

  const handlePoolClick = (chainId: number, roundId: string) => {
    navigate(`/staking-round/${chainId}/${roundId}`);
  };

  const { claimablePools, pendingPools, claimedPools, RewardsByPool, totalUnstaked } =
    processRewardsData(stakeOverview, handlePoolClick);

  const handleClaimAll = async (returnToMatchingPool: boolean) => {
    handleToggleConfirmationDialog();
    const claims = prepareClaimData(
      claimablePools,
      RewardsByPool,
      address ?? zeroAddress,
      returnToMatchingPool,
    );
    await batchClaim(claims, totalUnstaked);
    await refetch();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between rounded-lg bg-purple-50 px-[56px] py-6">
        <div className="flex flex-col items-start gap-2">
          <div className="text-grey-900 font-ui-sans text-sm font-semibold leading-7">
            Total claimable rewards
          </div>
          <div className="font-ui-mono text-[32px]/[41.66px] font-normal leading-7 text-black">
            {`$${rewardsAmountInUSD.toFixed(2)}`}
          </div>
        </div>
        <div>
          <Button
            value="Claim all rewards"
            variant="ghost"
            className={cn(
              "bg-white text-purple-700",
              "disabled:text-grey-500 disabled:bg-grey-100",
            )}
            onClick={handleToggleConfirmationDialog}
            disabled={claimablePools.length === 0 || isClaimLoading}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <span className="font-ui-sans text-2xl font-medium leading-7">
          {`Ready to claim (${claimablePools.length})`}
        </span>
        <div className="flex flex-col gap-4">
          {claimablePools.length > 0 ? (
            claimablePools.map((props) => (
              <StakePoolCard key={`${props.chainId}-${props.roundId}`} data={props} />
            ))
          ) : (
            <div className="py-4 text-center text-gray-500">No rewards ready to claim</div>
          )}
        </div>
      </div>

      {pendingPools.length > 0 && (
        <div className="flex flex-col gap-6">
          <span className="font-ui-sans text-2xl font-medium leading-7">
            {`Pending (${pendingPools.length})`}
          </span>
          <div className="flex flex-col gap-4">
            {pendingPools.map((props) => (
              <StakePoolCard key={`${props.chainId}-${props.roundId}`} data={props} />
            ))}
          </div>
        </div>
      )}

      {claimedPools.length > 0 && (
        <div className="flex flex-col gap-6">
          <span className="font-ui-sans text-2xl font-medium leading-7">
            {`Claimed (${claimedPools.length})`}
          </span>
          <div className="flex flex-col gap-4">
            {claimedPools.map((props) => (
              <StakePoolCard key={`${props.chainId}-${props.roundId}`} data={props} />
            ))}
          </div>
        </div>
      )}
      <ProgressModal isOpen={isClaimLoading} steps={steps} />
      <ClaimConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onOpenChange={handleToggleConfirmationDialog}
        onClaim={() => handleClaimAll(false)}
        onGiveBack={() => handleClaimAll(true)}
      />
    </div>
  );
};
