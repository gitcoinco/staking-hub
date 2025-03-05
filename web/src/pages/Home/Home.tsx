import { useAccount } from "wagmi";
import { NotConnected } from "./components/NotConnected";
import { StatCardGroup, StatCardGroupProps } from "@gitcoin/ui";
import { StakePoolCard, StakePoolDataCardProps } from "@gitcoin/ui/pool";
import { useNavigate } from "react-router-dom";

const statCardGroupProps: StatCardGroupProps = {
  stats: [
    {
      label: "Total GTC Staked",
      value: "1200 GTC",
      className: "bg-moss-50 w-full",
    },
    {
      label: "Estimated rewards",
      value: "$600.00",
      className: "bg-purple-50 w-full",
    },
    {
      label: "Active stakes",
      value: "3",
      className: "bg-blue-50 w-full",
    },
  ],
};

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
    stakedAmount: 100,
    lastStakeDate: new Date(),
    claimed: false,
    isLoading: false,
    onClaim: () => {},
  },
  {
    roundName: "Stake Pool 2",
    roundDescription: "Stake Pool 2 description",
    chainId: 10,
    roundId: "2",
    logoImg: "https://picsum.photos/101",
    votingStartDate: new Date(),
    votingEndDate: new Date(),
    totalProjects: 10,
    totalStaked: 100,
    matchingPoolAmount: 100,
    stakedAmount: 100,
    lastStakeDate: new Date(),
    claimed: false,
    isLoading: false,
    onClaim: () => {},
  },
];

export const Home = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  return (
    <div>
      {isConnected ? (
        <div className="flex flex-col gap-8">
          <StatCardGroup
            {...statCardGroupProps}
            className="grid xl:grid-cols-3 grid-cols-1"
          />
          <div className="flex flex-col gap-6">
            <span className="text-2xl font-medium font-ui-sans">
              {`Active Stakes (${stakePoolCardProps.length})`}
            </span>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {stakePoolCardProps.map((card) => (
                  <StakePoolCard
                    key={card.roundId}
                    data={{
                      ...card,
                      onClick: () => {
                        navigate(
                          `/staking-round/${card.chainId}/${card.roundId}`
                        );
                      },
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <NotConnected />
      )}
    </div>
  );
};
