"use client";

import { useRef, useState } from "react";
import { IconType } from "@gitcoin/ui";
import { Button } from "@gitcoin/ui";
import { Icon } from "@gitcoin/ui";
import { useClickOutside } from "@gitcoin/ui/hooks/useClickOutside";
import { getChainInfo } from "@gitcoin/ui/lib";
import { useDisconnect } from "wagmi";
import { useSquidWidget } from "@/hooks/frontend";
import { useGTC } from "@/hooks/tokens";

export const GtcPopover = () => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { setIsSquidOpen } = useSquidWidget();
  useClickOutside(popoverRef, () => {
    if (isOpen) setIsOpen(false);
  });
  const [isOpen, setIsOpen] = useState(false);

  const { chainId, ...balance } = useGTC();

  const { disconnect } = useDisconnect();
  const gtcAmount = Number(Number(balance?.formatted).toFixed(2));
  const chainInfo = getChainInfo(chainId ?? 1);

  const handleGetGTC = () => {
    setIsSquidOpen(true);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <div className="flex items-center justify-center gap-2">
        <div
          className="flex h-10 cursor-pointer items-center gap-2 rounded-3xl bg-green-50 px-2 py-1 shadow-md"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="rounded-full bg-green-100 p-1.5">
            <Icon type={IconType.GITCOIN} className="size-4" />
          </div>
          <span className="font-ui-mono shrink-0 text-sm font-normal">{gtcAmount} GTC</span>
          <Icon
            type={IconType.CHEVRON_DOWN}
            className={`${isOpen && "rotate-180"} transition-transform duration-200`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="border-grey-100 absolute left-0 top-full z-50 mt-2.5 origin-top-right rounded-b-2xl border-x border-b bg-white px-4 py-3 shadow-[0px_9px_24px_0px_rgba(0,0,0,0.20)]">
          <div className="w-full bg-gray-100 px-4 py-2">
            <div className="flex w-[225px] items-center justify-start gap-4">
              <Icon type={chainInfo.icon} className="size-8" />
              <div className="">
                <div className="font-ui-sans text-lg font-medium leading-7">{chainInfo.name}</div>
                <div className="flex items-center gap-2">
                  <span className="font-ui-mono text-sm font-normal">Balance</span>
                  <span className="font-ui-mono shrink-0 text-sm font-normal">{gtcAmount} GTC</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 py-2">
            <Button
              variant="secondary"
              value="Get GTC"
              icon={<Icon type={IconType.ARROW_RIGHT} className="size-4" />}
              iconPosition="right"
              className="w-full bg-blue-100"
              onClick={handleGetGTC}
            />
            <Button
              variant="ghost"
              value="Learn More"
              icon={<Icon type={IconType.EXTERNAL_LINK} className="size-4" />}
              iconPosition="right"
              className="w-full"
              onClick={() => {
                window.open(
                  "https://dashboard.boost.explorer.gitcoin.co/about-explorer-boost",
                  "_blank",
                );
              }}
            />
          </div>
          <div className="border-grey-100 w-full border-t" />
          <div className="shadow-b-lg flex items-center gap-2 px-1 pt-3">
            <div
              className="flex cursor-pointer justify-start gap-2"
              onClick={() => {
                disconnect();
                setIsOpen(false);
              }}
            >
              <Icon type={IconType.LOGOUT} />
              <div className="font-ui-mono text-sm font-medium">Disconnect</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
