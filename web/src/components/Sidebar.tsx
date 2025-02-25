import { IconType, SideNav, SideNavItem } from "@gitcoin/ui";
import { useNavigate } from "react-router";
import { useMemo } from "react";

export const Sidebar = () => {
  const navigate = useNavigate();
  
  const roundItems = [
    {
      name: "Example Round",
      chainId: "1",
      roundId: "123",
      iconType: IconType.ARBITRUM
    }
  ];

  const items = useMemo<SideNavItem[]>(
    () => [
      {
        content: "Dashboard",
        id: "/",
        iconType: IconType.HOME,
      },
      {
        content: "Grants Staking",
        id: "/grants-staking",
        iconType: IconType.GLOBE,
        items: roundItems.map(({ name, chainId, roundId, iconType }) => ({
          content: name,
          id: `/${chainId}/${roundId}/manage-round`,
          iconType,
        })),
      },
      {
        content: "Claim Rewards",
        id: "/claim-rewards",
        iconType: IconType.PENCIL,
      },
    ],
    [roundItems],
  );

  return (
    <SideNav 
      className="w-72" 
      items={items} 
      onClick={(id) => id && navigate(id)} 
    />
  );
}; 