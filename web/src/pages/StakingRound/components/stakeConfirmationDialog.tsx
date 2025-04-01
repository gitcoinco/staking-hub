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
import { getChainInfo, cn } from "@gitcoin/ui/lib";
import { useGTC } from "@/hooks";
import { useSquidWidget } from "@/hooks";

export const StakeConfirmationDialog = ({
  projectsToStake,
  isOpen,
  onOpenChange,
  onConfirm,
}: {
  projectsToStake: {
    name: string;
    stakeAmount: number;
  }[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) => {
  const { formatted, chainId } = useGTC();
  const { setIsSquidOpen, isSquidOpen } = useSquidWidget();

  const chainInfo = getChainInfo(chainId ?? 1);
  const totalCost = projectsToStake.reduce((acc, project) => acc + project.stakeAmount, 0);
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <Modal className={cn("w-[450px] p-6", isSquidOpen && "z-0")}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-8">
            <DialogHeader className="flex flex-col items-start gap-2 text-start">
              <div className="flex w-full justify-between">
                <DialogTitle className="text-3xl font-semibold">Confirm your stake</DialogTitle>
                <button onClick={() => onOpenChange(false)}>
                  <Icon type={IconType.X} />
                </button>
              </div>
              <DialogDescription className="text-[16px]/[26px]">
                Review your stake before finalizing.
              </DialogDescription>
            </DialogHeader>

            <div className="flex max-h-[200px] flex-col gap-2 overflow-y-auto">
              {projectsToStake.map((project) => (
                <div className="flex items-center justify-between">
                  <span className="font-ui-sans max-w-[250px] text-sm font-medium leading-tight">
                    {project.name}
                  </span>
                  <span className="font-ui-mono pr-2 text-sm font-medium leading-[21px]">{`${project.stakeAmount} GTC`}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Icon type={chainInfo?.icon} className="size-8" />
                <div className="flex flex-col gap-2">
                  <span className="font-ui-sans text-lg font-bold leading-tight">
                    {chainInfo?.name}
                  </span>
                  <span className="font-ui-mono text-sm font-medium leading-[21px]">{`Balance ${Number(formatted).toFixed(3)} GTC`}</span>
                </div>
              </div>
              <Button
                value="Get GTC"
                icon={<Icon type={IconType.ARROW_RIGHT} />}
                iconPosition="right"
                variant="ghost"
                className="w-fit"
                onClick={() => setIsSquidOpen(true)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-ui-mono text-sm font-normal">Total cost</div>
            <div className="font-ui-mono text-sm font-medium leading-[21px]">{`${totalCost.toFixed(3)} GTC`}</div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button
              value="Cancel"
              variant="outlined-primary"
              className="border-grey-100 w-fit text-black"
              onClick={() => onOpenChange(false)}
            />
            <Button value="Confirm" variant="primary" onClick={onConfirm} />
          </div>
        </div>
      </Modal>
    </Dialog>
  );
};
