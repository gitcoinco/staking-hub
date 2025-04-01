import { createContext, useRef, useState } from "react";
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
    fromChainId: "42161",
    toChainId: "1",
    fromTokenAddress: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    toTokenAddress: "0xde30da39c46104798bb5aa3fe8b9e0e1f348163f",
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
