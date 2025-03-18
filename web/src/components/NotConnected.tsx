import { ConnectButton } from "@rainbow-me/rainbowkit";

export const NotConnected = () => {
  return (
    <div className="flex h-1/2 flex-col items-center justify-center gap-8">
      <span className="font-ui-sans text-2xl font-medium">Connect your wallet to stake GTC</span>
      <ConnectButton label="Connect" />
    </div>
  );
};
