import React, { PropsWithChildren } from "react";
import { Outlet } from "react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { LoadingPage } from "@/components/Loading";

interface RouteProps {
  fallback: React.FC<PropsWithChildren<any>>;
  fallbackProps?: any;
}

export const ProtectedRouter = ({ fallback: Fallback }: RouteProps) => {
  const { isConnected, isConnecting } = useAccount();

  const isLoading = isConnecting;

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isConnected) {
    return (
      <Fallback>
        <ConnectButton />
      </Fallback>
    );
  }

  return <Outlet />;
};
