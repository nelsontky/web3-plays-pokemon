import {
  GAMEBOY_MEMORY_OFFSET,
  POKEMON_1_NAME,
  POKEMON_1_NICKNAME_START,
  POKEMON_INDEX,
  POKEMON_NICKNAME_SIZE,
  POKEMON_SIZE,
} from "common";
import { useMemo } from "react";

export default function usePartyData(gameboyMemory?: Uint8Array) {
  const pokemons = useMemo(() => {
    if (gameboyMemory === undefined) {
      return undefined;
    }
    return parsePokemonData(gameboyMemory);
  }, [gameboyMemory]);
}

interface Pokemon {
  name: string;
  nickname: string;
  hp: number;
  maxHp: number;
  level: number;
  moves: string[];
}

function parsePokemonData(gameboyMemory: Uint8Array): Pokemon[] {
  const MAX_POKEMON_IN_PARTY = 6;
  const pokemons: Pokemon[] = [];

  for (let i = 0; i < MAX_POKEMON_IN_PARTY; i++) {
    const nameSlice =
      gameboyMemory[POKEMON_1_NAME - GAMEBOY_MEMORY_OFFSET + i * POKEMON_SIZE];

    if (nameSlice > 0) {
      // only proceed if there is a pokemon in slot 1
      // console.log(POKEMON_INDEX[pokemonNameSlice]);
      const nicknameStart =
        POKEMON_1_NICKNAME_START - GAMEBOY_MEMORY_OFFSET + i * POKEMON_SIZE;
      const nicknameSlice = gameboyMemory.slice(
        nicknameStart,
        nicknameStart + POKEMON_NICKNAME_SIZE
      );
      console.log(nicknameSlice);
    }
  }

  return pokemons;
}
