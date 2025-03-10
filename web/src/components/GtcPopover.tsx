"use client";

import { IconType } from "@gitcoin/ui";

import { Button } from "@gitcoin/ui";

import { Icon } from "@gitcoin/ui";
import { useRef, useState } from "react";
import { useAccount } from "wagmi";
import { useDisconnect } from "wagmi";
import { useBalance } from "wagmi";
import { getChainInfo } from "@gitcoin/ui/lib";
import { useClickOutside } from "@gitcoin/ui/hooks/useClickOutside";

export const GtcPopover = () => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useClickOutside(popoverRef, () => {
    if (isOpen) setIsOpen(false);
  });
  const [isOpen, setIsOpen] = useState(false);
  const { address, chainId } = useAccount();
  const { data: balance } = useBalance({
    address,
    token: "0x7f9a7DB853Ca816B9A138AEe3380Ef34c437dEe0",
    chainId,
  });
  const { disconnect } = useDisconnect();
  const gtcAmount = Number(Number(balance?.formatted ?? 0).toFixed(2));
  const chainInfo = getChainInfo(chainId ?? 1);
  return (
    <div className="relative" ref={popoverRef}>
      <div className="flex items-center justify-center gap-2">
        <div
          className="flex items-center gap-2 cursor-pointer bg-green-50 rounded-3xl px-2 py-1 h-10 shadow-md"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="p-1.5 rounded-full bg-green-100">
            <Icon type={IconType.GITCOIN} className="size-4" />
          </div>
          <span className="font-normal text-sm font-ui-mono shrink-0">
            {gtcAmount} GTC
          </span>
          <Icon
            type={IconType.CHEVRON_DOWN}
            className={`${isOpen && "rotate-180"} transition-transform duration-200`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full origin-top-right px-4 py-3 mt-2.5 bg-white z-50 rounded-b-2xl shadow-[0px_9px_24px_0px_rgba(0,0,0,0.20)] border-x border-b border-grey-100 ">
          <div className="bg-gray-100 px-4 py-2 w-full">
            <div className="flex justify-start items-center gap-4 w-[225px]">
              <Icon type={chainInfo.icon} className="size-8" />
              <div className="">
                <div className="text-lg font-medium leading-7 font-ui-sans">
                  {chainInfo.name}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-normal text-sm font-ui-mono">
                    Balance
                  </span>
                  <span className="font-normal text-sm font-ui-mono shrink-0">
                    {gtcAmount} GTC
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className=" py-2">
            <Button
              variant="secondary"
              value="Get GTC"
              icon={<Icon type={IconType.ARROW_RIGHT} />}
              iconPosition="right"
              className="w-full bg-blue-100"
            />
          </div>
          <div className="border-t border-grey-100 w-full" />
          <div className="flex gap-2 items-center px-1 pt-3 shadow-b-lg ">
            <div
              className="flex justify-start gap-2 cursor-pointer"
              onClick={() => {
                disconnect();
                setIsOpen(false);
              }}
            >
              <Icon type={IconType.LOGOUT} />
              <div className="text-sm font-medium font-ui-mono">Disconnect</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
