import {
  Dialog,
  DialogHeader,
  DialogTitle,
  IconType,
  Icon,
  DialogDescription,
  Modal,
  Button,
} from "@gitcoin/ui";

export const ClaimConfirmationDialog = ({
  isOpen,
  onOpenChange,
  onClaim,
  onGiveBack,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClaim: () => void;
  onGiveBack: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <Modal className="max-w-[676px] p-6">
        <div className="flex flex-col gap-6">
          <DialogHeader className="flex flex-col items-start gap-2 text-start">
            <div className="flex w-full justify-between">
              <DialogTitle className="text-3xl font-semibold">
                Ready to claim your rewards?
              </DialogTitle>
              <button onClick={() => onOpenChange(false)}>
                <Icon type={IconType.X} />
              </button>
            </div>
            <DialogDescription className="text-[16px]/[26px]">
              You're about to claim your staking rewards and unstake your GTC.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <h3 className="font-ui-sans text-xl">What to expect:</h3>

            <div className="flex flex-col gap-3">
              <div className="text-p font-ui-sans">
                💸 Rewards Claim: You can claim all rewards for yourself or donate them to Gitcoin’s
                matching pool to support future funding rounds 💙 💯
              </div>

              <div className="text-p font-ui-sans">
                👍 Unstaking GTC: Your staked GTC will be withdrawn
              </div>
            </div>

            <p className="text-p font-ui-sans font-normal">
              This process requires multiple approvals in your wallet.
            </p>
          </div>

          <div className="mt-2 flex items-center justify-center gap-3">
            <Button
              value="💙 Give back to the matching pool 💙"
              variant="light-blue"
              className="w-fit bg-blue-300 hover:bg-blue-400"
              onClick={onGiveBack}
            />
            <Button
              value="🤑 Claim my rewards"
              variant="outlined-primary"
              className="border-grey-100 w-fit text-purple-500"
              onClick={onClaim}
            />
          </div>
        </div>
      </Modal>
    </Dialog>
  );
};
