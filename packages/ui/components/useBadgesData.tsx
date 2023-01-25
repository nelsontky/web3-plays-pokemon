import { BADGES_INDEX, BADGE_NAMES, GAMEBOY_MEMORY_OFFSET } from "common";
import { useMemo } from "react";
import Badges from "../types/badges";

export default function useBadgesData(gameboyMemory?: Uint8Array) {
  const badges = useMemo(() => {
    if (gameboyMemory === undefined) {
      return undefined;
    }

    return parseBadgesData(gameboyMemory);
  }, [gameboyMemory]);

  return badges;
}

const parseBadgesData = (gameboyMemory: Uint8Array): Badges => {
  const TOTAL_BADGES_COUNT = 8;

  let encodedBadges = gameboyMemory[BADGES_INDEX - GAMEBOY_MEMORY_OFFSET];
  let badgesCount = 0;
  const badgesObtained = [];
  for (let i = 0; i < TOTAL_BADGES_COUNT; i++) {
    const masked = (encodedBadges & (0b00000001 << i)) >> i;
    badgesCount += masked;
    if (masked > 0) {
      badgesObtained.push(BADGE_NAMES[i]);
    }
  }

  return {
    count: `${badgesCount} / ${TOTAL_BADGES_COUNT}`,
    badgesObtained,
  };
};
