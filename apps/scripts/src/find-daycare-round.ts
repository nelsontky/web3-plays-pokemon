import * as anchor from "@project-serum/anchor";
import idl from "./solana_plays_pokemon_program.json";
import { SolanaPlaysPokemonProgram } from "./solana_plays_pokemon_program";
import {
  PROGRAM_ID,
  GAME_DATA_ACCOUNT_ID,
  GAMEBOY_MEMORY_OFFSET,
  POKEMON_1_NAME,
  POKEMON_INDEX,
  POKEMON_SIZE,
} from "common";
import axios from "axios";
import { inflate } from "pako";

export const GAME_DATA_ACCOUNT_PUBLIC_KEY = new anchor.web3.PublicKey(
  GAME_DATA_ACCOUNT_ID
);

const readonlyKeypair = anchor.web3.Keypair.generate();
const connection = new anchor.web3.Connection("");
anchor.setProvider({
  connection,
});

const program = new anchor.Program(
  idl as anchor.Idl,
  PROGRAM_ID
) as unknown as anchor.Program<SolanaPlaysPokemonProgram>;

(async () => {
  const LEFT_INDEX = 10250;
  const RIGHT_INDEX = 10251;

  const [gameStatePda1] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
      Buffer.from("game_state"),
      Buffer.from("" + LEFT_INDEX),
    ],
    program.programId
  );
  const gameState1 = await program.account.gameStateV3.fetch(gameStatePda1);
  const saveStateCid1 = gameState1.saveStateCid;
  const response1 = await axios.get(
    `https://${saveStateCid1}.ipfs.cf-ipfs.com`,
    {
      responseType: "arraybuffer",
    }
  );
  const inflated1 = inflate(response1.data, { to: "string" });
  const data1 = JSON.parse(inflated1);
  console.log(LEFT_INDEX, parsePokemonData(data1.gameboyMemory));
  console.log(gameState1);

  const [gameStatePda2] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
      Buffer.from("game_state"),
      Buffer.from("" + RIGHT_INDEX),
    ],
    program.programId
  );
  const gameState2 = await program.account.gameStateV3.fetch(gameStatePda2);
  const saveStateCid2 = gameState2.saveStateCid;
  const response2 = await axios.get(
    `https://${saveStateCid2}.ipfs.cf-ipfs.com`,
    {
      responseType: "arraybuffer",
    }
  );
  const inflated2 = inflate(response2.data, { to: "string" });
  const data2 = JSON.parse(inflated2);
  console.log(RIGHT_INDEX, parsePokemonData(data2.gameboyMemory));
})();

function parsePokemonData(gameboyMemory: Uint8Array) {
  const MAX_POKEMONS_IN_PARTY = 6;
  const pokemons: string[] = [];

  for (let i = 0; i < MAX_POKEMONS_IN_PARTY; i++) {
    const encodedName =
      gameboyMemory[POKEMON_1_NAME - GAMEBOY_MEMORY_OFFSET + i * POKEMON_SIZE];

    if (encodedName > 0) {
      const name = POKEMON_INDEX[encodedName] as string;

      pokemons.push(name);
    }
  }

  return pokemons;
}
