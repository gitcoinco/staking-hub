import { useEffect } from "react";
import { Routes, Route } from "react-router";
import { MainLayout } from "@/layouts/MainLayout";
import { ClaimRewards, Home, StakingRound, StakingRounds } from "@/pages";
import { ProtectedRouter } from "./ProtectedRouter";

function useHashRedirect() {
  useEffect(() => {
    const { pathname, hash, search } = window.location;

    // Only redirect if:
    // 1. We're not at the root path
    // 2. There's no hash already
    // 3. It's not a hash-only URL (/#/)
    if (pathname !== "/" && !hash) {
      const cleanPath = pathname.replace(/^\/|\/$/g, "");
      const redirectUrl = new URL(window.location.href);
      redirectUrl.pathname = "/";
      redirectUrl.hash = `#/${cleanPath}`;

      // Preserve any search params
      if (search) {
        redirectUrl.search = search;
      }

      window.location.href = redirectUrl.toString();
    }
  }, []);
}

export const Router = () => {
  useHashRedirect();
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route element={<ProtectedRouter fallback={Home} />}>
          <Route path="/" element={<Home />} />
          <Route path="/staking-rounds" element={<StakingRounds />} />

          <Route
            path="/staking-round/:chainId/:roundId"
            element={<StakingRound />}
          />
          <Route path="/claim-rewards" element={<ClaimRewards />} />
        </Route>
      </Route>
    </Routes>
  );
};
