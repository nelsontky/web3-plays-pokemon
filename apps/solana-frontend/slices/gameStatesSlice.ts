import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import * as anchor from "@project-serum/anchor";
import { SolanaPlaysPokemonProgram } from "solana-plays-pokemon-program";
import { GAME_DATA_ACCOUNT_PUBLIC_KEY, PROGRAM_PUBLIC_KEY } from "../constants";
import { RootState } from "../store";
import { BUTTON_ID_TO_ENUM } from "common";

const NUMBER_OF_STATES_TO_LOAD = 20;

interface GameState {
  version: number;

  accountPublicKey: string;

  index: number;

  buttonPresses: number[];

  createdAt: number;

  framesImageCid: string;
  saveStateCid: string;
}

const gameStatesAdapter = createEntityAdapter<GameState>({
  selectId: (gameState) => gameState.index,
  sortComparer: (a, b) => b.index - a.index,
});

const initialState = gameStatesAdapter.getInitialState<{
  status: "idle" | "loading" | "failed" | "succeeded";
  framesImageCidToRender: string;
  currentSaveStateCid: string;
}>({
  status: "idle",
  framesImageCidToRender: "",
  currentSaveStateCid: "",
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
      ReturnType<typeof program.account.gameStateV4.fetch>
    >;
    const existingGameStates = (
      await program.account.gameStateV4.fetchMultiple(gameStatesPdas)
    ).filter(Boolean) as RawGameState[];

    const reduxGameStates: GameState[] = existingGameStates.map((state, i) => ({
      ...state,
      accountPublicKey: gameStatesPdas[i].toBase58(),
      createdAt: state.createdAt.toNumber(),
      executedButton: BUTTON_ID_TO_ENUM[state.executedButton as number],
      buttonPresses: Array.from(state.buttonPresses),
    }));

    return reduxGameStates;
  }
);

const gameStatesSlice = createSlice({
  name: "gameStates",
  initialState,
  reducers: {
    upsertGameState: (state, action: PayloadAction<GameState>) => {
      if (action.payload.framesImageCid.length > 0) {
        state.framesImageCidToRender = action.payload.framesImageCid;
      }
      if (action.payload.saveStateCid.length > 0) {
        state.currentSaveStateCid = action.payload.saveStateCid;
      }

      gameStatesAdapter.upsertOne(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialGameStates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInitialGameStates.fulfilled, (state, action) => {
        const latestFramesImageCid =
          action.payload.find((state) => state.framesImageCid.length > 0)
            ?.framesImageCid ?? "";

        const currentSaveStateCid =
          action.payload.find((state) => state.saveStateCid.length > 0)
            ?.saveStateCid ?? "";

        state.status = "succeeded";
        state.framesImageCidToRender = latestFramesImageCid;
        state.currentSaveStateCid = currentSaveStateCid;
        gameStatesAdapter.upsertMany(state, action.payload);
      })
      .addCase(fetchInitialGameStates.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { upsertGameState } = gameStatesSlice.actions;

export const {
  selectAll: selectAllGameStates,
  selectById: selectGameStateById,
  selectIds: selectGameStateIds,
} = gameStatesAdapter.getSelectors<RootState>((state) => state.gameStates);

export default gameStatesSlice.reducer;
