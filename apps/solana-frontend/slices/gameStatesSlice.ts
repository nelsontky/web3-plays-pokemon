import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import * as anchor from "@project-serum/anchor";
import { SolanaPlaysPokemonProgram } from "solana-plays-pokemon-program";
import { GAME_DATA_ACCOUNT_PUBLIC_KEY, PROGRAM_PUBLIC_KEY } from "../constants";

const NUMBER_OF_STATES_TO_LOAD = 20;

interface GameState {
  accountPublicKey: string;

  second: number;

  upCount: number;
  downCount: number;
  leftCount: number;
  rightCount: number;
  aCount: number;
  bCount: number;
  startCount: number;
  selectCount: number;
  nothingCount: number;

  createdAt: number;

  framesImageCid: string;
  saveStateCid: string;
}

const gameStatesAdapter = createEntityAdapter<GameState>({
  selectId: (gameState) => gameState.second,
});

const initialState = gameStatesAdapter.getInitialState<{
  status: "idle" | "loading" | "failed" | "succeeded";
}>({
  status: "idle",
});

export const fetchInitialGameStates = createAsyncThunk(
  "gameStates/fetchInitialStates",
  async ({
    program,
    secondsPlayed,
  }: {
    program: anchor.Program<SolanaPlaysPokemonProgram>;
    secondsPlayed: number;
  }) => {
    const gameStatesPdas = Array.from(
      { length: NUMBER_OF_STATES_TO_LOAD },
      (_, i) => {
        const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
          [
            GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
            Buffer.from("game_state"),
            Buffer.from("" + (secondsPlayed - i)),
          ],
          PROGRAM_PUBLIC_KEY
        );
        return gameStatePda;
      }
    );

    type RawGameState = Awaited<
      ReturnType<typeof program.account.gameState.fetch>
    >;
    const existingGameStates = (
      await program.account.gameState.fetchMultiple(gameStatesPdas)
    ).filter(Boolean) as RawGameState[];

    const reduxGameStates: GameState[] = existingGameStates.map((state, i) => ({
      ...state,
      accountPublicKey: gameStatesPdas[i].toBase58(),
      createdAt: state.createdAt.toNumber(),
    }));

    return reduxGameStates;
  }
);

const gameStatesSlice = createSlice({
  name: "gameData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialGameStates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInitialGameStates.fulfilled, (state, action) => {
        state.status = "succeeded";
        gameStatesAdapter.upsertMany(state, action.payload);
      })
      .addCase(fetchInitialGameStates.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default gameStatesSlice.reducer;
