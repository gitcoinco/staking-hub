import { ConnectButton } from "@rainbow-me/rainbowkit";

export const NotConnected = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 py-16">
      <span className="text-2xl font-medium font-ui-sans">
        Connect your wallet to stake GTC
      </span>
      <ConnectButton label="Connect" />
    </div>
  );
};
