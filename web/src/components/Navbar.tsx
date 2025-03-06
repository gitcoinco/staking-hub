"use client";

import { Navbar as GitcoinNavbar } from "@gitcoin/ui";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { GetGtcPopover } from "./GetGtcPopover";
// TODO: use new navbar and wrap the logo with NavLink of react-router
export const Navbar = () => {
  return (
    <GitcoinNavbar
      className="bg-white/5 shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)] backdrop-blur-[44px] z-50"
      showDivider={true}
      text={{
        text: "GTC Staker",
      }}
    >
      <div className="flex items-center gap-2">
        <GetGtcPopover />
        <ConnectButton chainStatus="icon" />
      </div>
    </GitcoinNavbar>
  );
};
