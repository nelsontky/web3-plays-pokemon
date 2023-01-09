import {
  GAMEBOY_MEMORY_OFFSET,
  memorySliceToString,
  POKEMON_1_HP_START,
  POKEMON_1_LEVEL,
  POKEMON_1_MAX_HP_START,
  POKEMON_1_NAME,
  POKEMON_1_NICKNAME_START,
  POKEMON_HP_SIZE,
  POKEMON_INDEX,
  POKEMON_NICKNAME_SIZE,
  POKEMON_SIZE,
} from "common";
import { useMemo } from "react";
import Pokemon from "../types/pokemon";

export default function usePartyData(gameboyMemory?: Uint8Array) {
  const pokemons = useMemo(() => {
    if (gameboyMemory === undefined) {
      return undefined;
    }
    return parsePokemonData(gameboyMemory);
  }, [gameboyMemory]);

  return pokemons;
}

function parsePokemonData(gameboyMemory: Uint8Array): Pokemon[] {
  const MAX_POKEMONS_IN_PARTY = 6;
  const pokemons: Pokemon[] = [];

  for (let i = 0; i < MAX_POKEMONS_IN_PARTY; i++) {
    const encodedName =
      gameboyMemory[POKEMON_1_NAME - GAMEBOY_MEMORY_OFFSET + i * POKEMON_SIZE];

    if (encodedName > 0) {
      // only proceed if there is a pokemon in slot i
      const nicknameStart =
        POKEMON_1_NICKNAME_START -
        GAMEBOY_MEMORY_OFFSET +
        i * POKEMON_NICKNAME_SIZE;
      const nicknameSlice = gameboyMemory.slice(
        nicknameStart,
        nicknameStart + POKEMON_NICKNAME_SIZE
      );

      const hpStart =
        POKEMON_1_HP_START - GAMEBOY_MEMORY_OFFSET + i * POKEMON_SIZE;
      const hpSlice = gameboyMemory.slice(hpStart, hpStart + POKEMON_HP_SIZE);

      const maxHpStart =
        POKEMON_1_MAX_HP_START - GAMEBOY_MEMORY_OFFSET + i * POKEMON_SIZE;
      const maxHpSlice = gameboyMemory.slice(
        maxHpStart,
        maxHpStart + POKEMON_HP_SIZE
      );

      const levelStart =
        POKEMON_1_LEVEL - GAMEBOY_MEMORY_OFFSET + i * POKEMON_SIZE;
      const level = gameboyMemory[levelStart];

      const name = POKEMON_INDEX[encodedName] as string;
      const nickname = memorySliceToString(nicknameSlice);
      const hp = (hpSlice[0] << 16) + hpSlice[1];
      const maxHp = (maxHpSlice[0] << 16) + maxHpSlice[1];

      pokemons.push({
        name,
        nickname: nickname === name ? null : nickname,
        hp,
        maxHp,
        level,
      });
    }
  }

  return pokemons;
}
