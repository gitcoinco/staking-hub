"use client";

import { Navbar as GitcoinNavbar, Icon, IconType } from "@gitcoin/ui";
import { cn } from "@gitcoin/ui/lib";
import { GitcoinLogo, ExplorerLogo } from "@gitcoin/ui/logos";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { GtcPopover } from "./GtcPopover";


export const Navbar = () => {
  const { address } = useAccount();

  return (
    <GitcoinNavbar
      className="z-50 bg-white/5 shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)] backdrop-blur-[44px]"
      showDivider={true}
      text={{
        text: "Explorer Boost",
        className: "text-2xl font-medium",
      }}
      secondaryLogo={{
        img: ExplorerLogo,
        size: "size-8",
      }}
      primaryLogo={{
        img: GitcoinLogo,
        size: "w-[26.7px] h-[32px]",
      }}
    >
      <div className="flex items-center gap-6">
        <GtcPopover />
        <ConnectButton chainStatus="icon" />
        <div className="flex items-center gap-4">
          <Icon
            type={IconType.USER_CIRCLE}
            className={cn("size-6", {
              "cursor-pointer": address,
            })}
            onClick={() => {
              window.open(`https://explorer.gitcoin.co/#/contributors/${address}`, "_blank");
            }}
          />
          <Icon
            type={IconType.SHOPPING_CART}
            className={cn("size-6", {
              "cursor-pointer": address,
            })}
            onClick={() => {
              window.open("https://explorer.gitcoin.co/#/cart", "_blank");
            }}
          />
        </div>
      </div>
    </GitcoinNavbar>
  );
};
