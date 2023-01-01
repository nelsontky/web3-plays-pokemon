import * as anchor from "@project-serum/anchor";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SolanaPlaysPokemonProgram } from "solana-plays-pokemon-program";
import { GAME_DATA_ACCOUNT_PUBLIC_KEY } from "../constants";

interface GameDataState {
  secondsPlayed: number;
  isExecuting: boolean;
  status: "idle" | "loading" | "failed" | "succeeded";
}

const initialState: GameDataState = {
  secondsPlayed: 0,
  isExecuting: false,
  status: "idle",
};

export const fetchGameData = createAsyncThunk(
  "gameData/fetchGameData",
  async (program: anchor.Program<SolanaPlaysPokemonProgram>) => {
    const gameData = await program.account.gameData.fetch(
      GAME_DATA_ACCOUNT_PUBLIC_KEY
    );

    return {
      secondsPlayed: gameData.secondsPlayed,
      isExecuting: gameData.isExecuting,
    };
  }
);

const gameDataSlice = createSlice({
  name: "gameData",
  initialState,
  reducers: {
    setGameData: (
      state,
      action: PayloadAction<{ secondsPlayed: number; isExecuting: boolean }>
    ) => {
      state.secondsPlayed = action.payload.secondsPlayed;
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
        state.secondsPlayed = action.payload.secondsPlayed;
        state.isExecuting = action.payload.isExecuting;
      })
      .addCase(fetchGameData.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { setGameData } = gameDataSlice.actions;

export default gameDataSlice.reducer;
