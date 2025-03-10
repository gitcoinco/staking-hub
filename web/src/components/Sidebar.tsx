import { Icon, IconType, SideNav, SideNavItem } from "@gitcoin/ui";
import { useLocation, useNavigate } from "react-router";
import { useMemo } from "react";
// Get from current path the chainId and roundId and the path and pass into the SideNav props the activeId

export const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeId = useMemo(() => {
    // Handle both hash and non-hash routes
    if (pathname.includes("#/")) {
      return pathname.split("#/")[1] || "/";
    }
    // Handle root path
    return pathname === "/" ? "/" : pathname.slice(1);
  }, [pathname]);

  const roundItems = [
    {
      name: "Example Round",
      chainId: "1",
      roundId: "123",
      iconType: IconType.ARBITRUM,
    },
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
        isRecursive: true,
        items: [
          {
            content: "All Grants",
            id: "staking-rounds",
          },
          {
            content: "Active",
            id: pathname,
            isSeparator: true,
          },

          ...roundItems.map(({ name, chainId, roundId, iconType }) => ({
            content: name,
            id: `staking-round/${chainId}/${roundId}`,
            iconType,
          })),
        ],
      },
      {
        content: "Claim Rewards",
        id: "/claim-rewards",
        icon: (
          <Icon
            type={IconType.LIGHTNING_BOLT}
            className="stroke-black fill-black"
          />
        ),
      },
    ],
    [roundItems]
  );

  return (
    <SideNav
      className="w-72"
      items={items}
      onClick={(id) => id && navigate(id)}
      activeId={activeId}
    />
  );
};
