import { createContext, useRef, useState } from "react";
import { NATIVE } from "@allo-team/allo-v2-sdk";
import { Dialog, Modal } from "@gitcoin/ui";
import { useClickOutside } from "@gitcoin/ui/hooks/useClickOutside";
import SquidWidget, { SwapParams } from "@/components/SquidWidget";

type SquidContextType = {
  isSquidOpen: boolean;
  setIsSquidOpen: (isSquidOpen: boolean) => void;
};

export const SquidContext = createContext<SquidContextType>({
  isSquidOpen: false,
  setIsSquidOpen: () => {},
});

export const SquidProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSquidOpen, setIsSquidOpen] = useState(false);
  const swapParams: SwapParams = {
    fromChainId: "1",
    toChainId: "1",
    fromTokenAddress: NATIVE,
    toTokenAddress: NATIVE,
  };
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => {
    if (isSquidOpen) setIsSquidOpen(false);
  });
  return (
    <SquidContext.Provider value={{ isSquidOpen, setIsSquidOpen }}>
      {children}

      <Dialog open={isSquidOpen} onOpenChange={setIsSquidOpen}>
        <Modal ref={modalRef} className="flex items-center justify-center bg-[#FBFBFD]">
          <SquidWidget {...swapParams} />
        </Modal>
      </Dialog>
    </SquidContext.Provider>
  );
};
