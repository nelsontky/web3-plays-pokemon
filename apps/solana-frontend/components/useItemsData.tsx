import { GAMEBOY_MEMORY_OFFSET, ITEMS_INDEX, TOTAL_ITEMS_INDEX } from "common";
import { useMemo } from "react";
import Item from "../types/item";

export default function useItemsData(gameboyMemory?: Uint8Array) {
  const items = useMemo(() => {
    if (gameboyMemory === undefined) {
      return undefined;
    }

    return parseItemsData(gameboyMemory);
  }, [gameboyMemory]);

  return items;
}

const parseItemsData = (gameboyMemory: Uint8Array): Item[] => {
  const numberOfItems =
    gameboyMemory[TOTAL_ITEMS_INDEX - GAMEBOY_MEMORY_OFFSET];

  const items = Array.from({ length: numberOfItems }, (_, itemIndex) => {
    const itemNameMemoryIndex =
      2 * itemIndex + (TOTAL_ITEMS_INDEX - GAMEBOY_MEMORY_OFFSET + 1);
    const itemQuantityMemoryIndex = itemNameMemoryIndex + 1;

    const itemNameIndex = gameboyMemory[itemNameMemoryIndex];
    const name = ITEMS_INDEX[itemNameIndex];

    const quantity = gameboyMemory[itemQuantityMemoryIndex];

    return {
      name,
      quantity,
    };
  });

  return items;
};
