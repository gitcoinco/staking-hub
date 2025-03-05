import { Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { Home, StakingRound, StakingRounds, ClaimRewards } from "./pages";
function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Add your routes here */}
        <Route path="/" element={<Home />} />
        <Route path="/staking-rounds" element={<StakingRounds />} />

        <Route
          path="/staking-round/:chainId/:roundId"
          element={<StakingRound />}
        />
        <Route path="/claim-rewards" element={<ClaimRewards />} />
      </Route>
    </Routes>
  );
}

export default App;
