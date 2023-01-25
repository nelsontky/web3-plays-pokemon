import * as anchor from "@project-serum/anchor";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SolanaPlaysPokemonProgram } from "solana-plays-pokemon-program";

export interface GameDataState {
  executedStatesCount: number;
  isExecuting: boolean;
  nftsMinted: number;
  status: "idle" | "loading" | "failed" | "succeeded";
}

const initialState: GameDataState = {
  executedStatesCount: 0,
  isExecuting: false,
  nftsMinted: 0,
  status: "idle",
};

export const fetchGameData = createAsyncThunk(
  "gameData/fetchGameData",
  async ({
    program,
    gameDataAccountPublicKey,
  }: {
    gameDataAccountPublicKey: anchor.web3.PublicKey;
    program: anchor.Program<SolanaPlaysPokemonProgram>;
  }) => {
    const gameData = await program.account.gameData.fetch(
      gameDataAccountPublicKey
    );

    return {
      executedStatesCount: gameData.executedStatesCount,
      isExecuting: gameData.isExecuting,
      nftsMinted: gameData.nftsMinted,
    };
  }
);

const gameDataSlice = createSlice({
  name: "gameData",
  initialState,
  reducers: {
    setGameData: (
      state,
      action: PayloadAction<{
        executedStatesCount: number;
        isExecuting: boolean;
      }>
    ) => {
      state.executedStatesCount = action.payload.executedStatesCount;
      state.isExecuting = action.payload.isExecuting;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGameData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGameData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.executedStatesCount = action.payload.executedStatesCount;
        state.isExecuting = action.payload.isExecuting;
        state.nftsMinted = action.payload.nftsMinted;
      })
      .addCase(fetchGameData.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { setGameData } = gameDataSlice.actions;

export default gameDataSlice.reducer;
