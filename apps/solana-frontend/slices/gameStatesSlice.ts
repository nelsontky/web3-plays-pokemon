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
import { anchorEnumToJsEnum, BUTTON_ID_TO_ENUM, JoypadButton } from "common";

const NUMBER_OF_STATES_TO_LOAD = 2;

interface GameState {
  accountPublicKey: string;

  index: number;

  votes: number[];

  createdAt: number;

  executedButton: JoypadButton;

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
}>({
  status: "idle",
  framesImageCidToRender: "",
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
      ReturnType<typeof program.account.gameStateV2.fetch>
    >;
    const existingGameStates = (
      await program.account.gameStateV2.fetchMultiple(gameStatesPdas)
    ).filter(Boolean) as RawGameState[];

    const reduxGameStates: GameState[] = existingGameStates.map((state, i) => ({
      ...state,
      accountPublicKey: gameStatesPdas[i].toBase58(),
      createdAt: state.createdAt.toNumber(),
      executedButton: BUTTON_ID_TO_ENUM[state.executedButton as number],
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
      gameStatesAdapter.upsertOne(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialGameStates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInitialGameStates.fulfilled, (state, action) => {
        const latestFramesImageCId =
          action.payload.find((state) => state.framesImageCid.length > 0)
            ?.framesImageCid ?? "";

        state.status = "succeeded";
        state.framesImageCidToRender = latestFramesImageCId;
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
