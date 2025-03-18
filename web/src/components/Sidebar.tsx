import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { Icon, IconType, SideNav, SideNavItem } from "@gitcoin/ui";
import { getChainInfo } from "@gitcoin/ui/lib";
import moment from "moment";
import { useGetAllPoolsOverview } from "@/hooks/backend";

export const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: poolsOverview } = useGetAllPoolsOverview();

  const activeId = useMemo(() => {
    // Handle both hash and non-hash routes
    if (pathname.includes("#/")) {
      return pathname.split("#/")[1] || "/";
    }
    // Handle root path
    return pathname === "/" ? "/" : pathname.slice(1);
  }, [pathname]);

  const roundItems =
    poolsOverview?.map((pool) => ({
      name: pool.roundMetadata.name,
      chainId: pool.chainId,
      roundId: pool.id,
      iconType: getChainInfo(pool.chainId).icon,
    })) || [];

  const activeRoundsItems = useMemo<SideNavItem[]>(() => {
    const activeRounds =
      poolsOverview
        ?.filter((round) => moment(round.donationsEndTime).isAfter(moment()))
        .map((pool) => ({
          content: pool.roundMetadata.name,
          id: `staking-round/${pool.chainId}/${pool.id}`,
          iconType: getChainInfo(pool.chainId).icon,
        })) || [];
    if (activeRounds.length === 0) {
      return [];
    }
    return [
      {
        content: "Active rounds",
        id: pathname,
        isSeparator: true,
      },
      ...activeRounds,
    ];
  }, [poolsOverview]);

  const endedRoundsItems = useMemo<SideNavItem[]>(() => {
    const endedRounds =
      poolsOverview
        ?.filter((round) => moment(round.donationsEndTime).isBefore(moment()))
        .map((pool) => ({
          content: pool.roundMetadata.name,
          id: `staking-round/${pool.chainId}/${pool.id}`,
          iconType: getChainInfo(pool.chainId).icon,
        })) || [];
    if (endedRounds.length === 0) {
      return [];
    }
    return [
      {
        content: "Ended rounds",
        id: pathname,
        isSeparator: true,
      },
      ...endedRounds,
    ];
  }, [poolsOverview]);

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
          ...activeRoundsItems,
          ...endedRoundsItems,
        ],
      },
      {
        content: "Claim Rewards",
        id: "/claim-rewards",
        icon: <Icon type={IconType.LIGHTNING_BOLT} className="fill-black stroke-black" />,
      },
    ],
    [roundItems],
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
