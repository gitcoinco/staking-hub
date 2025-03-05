import { StakePoolCard, StakePoolDataCardProps } from "@gitcoin/ui/pool";
import { useNavigate } from "react-router-dom";

const stakePoolCardProps: StakePoolDataCardProps[] = [
  {
    roundName: "Stake Pool 1",
    roundDescription: "Stake Pool 1 description",
    chainId: 10,
    roundId: "1",
    logoImg: "https://picsum.photos/100",
    votingStartDate: new Date(),
    votingEndDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 60),
    totalProjects: 10,
    totalStaked: 100,
    matchingPoolAmount: 100,
    onClaim: () => {},
  },
  {
    roundName: "Stake Pool 2",
    roundDescription: "Stake Pool 2 description",
    chainId: 10,
    roundId: "2",
    logoImg: "https://picsum.photos/101",
    votingStartDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 60),
    votingEndDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 66),
    totalProjects: 10,
    totalStaked: 100,
    matchingPoolAmount: 100,
    onClaim: () => {},
  },
  {
    roundName: "Stake Pool 3",
    roundDescription: "Stake Pool 3 description",
    chainId: 10,
    roundId: "3",
    logoImg: "https://picsum.photos/103",
    votingStartDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 60),
    votingEndDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 66),
    totalProjects: 10,
    totalStaked: 100,
    matchingPoolAmount: 100,
    onClaim: () => {},
  },
  {
    roundName: "Stake Pool 4",
    roundDescription: "Stake Pool 4 description",
    chainId: 10,
    roundId: "4",
    logoImg: "https://picsum.photos/104",
    votingStartDate: new Date(),
    votingEndDate: new Date(),
    totalProjects: 10,
    totalStaked: 100,
    matchingPoolAmount: 100,
    onClaim: () => {},
  },
];
export const StakingRounds = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-4">
      {stakePoolCardProps.map((card) => (
        <StakePoolCard
          key={card.roundId}
          data={{
            ...card,
            onClick: () => {
              navigate(`/staking-round/${card.chainId}/${card.roundId}`);
            },
          }}
        />
      ))}
    </div>
  );
};
