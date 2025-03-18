import { Outlet } from "react-router";
import { useAccount } from "wagmi";
import { LoadingPage } from "@/components/Loading";
import { NotConnected } from "@/components/NotConnected";

export const ProtectedRouter = () => {
  const { isConnected, isConnecting } = useAccount();

  const isLoading = isConnecting;
  if (!isConnected) {
    return <NotConnected />;
  }
  if (isLoading) {
    return <LoadingPage />;
  }

  return <Outlet />;
};
