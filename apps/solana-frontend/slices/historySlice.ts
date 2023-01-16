import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import * as anchor from "@project-serum/anchor";
import { SolanaPlaysPokemonProgram } from "solana-plays-pokemon-program";
import { GAME_DATA_ACCOUNT_PUBLIC_KEY, PROGRAM_PUBLIC_KEY } from "../constants";
import { RootState } from "../store";
import fetchIpfsCid from "../utils/fetchIpfsCid";
import { inflate } from "pako";
import type { Participant } from "../utils/getGameStateParticipants";
import getGameStateParticipants from "../utils/getGameStateParticipants";

interface History {
  accountPublicKey: string;
  index: number;
  createdAt: number;
  framesImageData: number[][];
  participants: Participant[];
}

const historyAdapter = createEntityAdapter<History>({
  selectId: (gameState) => gameState.index,
});

const initialState = historyAdapter.getInitialState();

export const fetchHistory = createAsyncThunk(
  "history/fetchHistory",
  async ({
    program,
    index,
  }: {
    program: anchor.Program<SolanaPlaysPokemonProgram>;
    index: number;
  }) => {
    const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + index),
      ],
      PROGRAM_PUBLIC_KEY
    );

    const participantsPromise = getGameStateParticipants(gameStatePda);

    const gameState = await Promise.any([
      program.account.gameStateV4.fetch(gameStatePda),
      program.account.gameStateV3.fetch(gameStatePda),
      program.account.gameStateV2.fetch(gameStatePda),
      program.account.gameState.fetch(gameStatePda),
    ]);

    // fetch frames images data
    const framesImageResponse = await fetchIpfsCid(gameState.framesImageCid);
    const inflated = inflate(framesImageResponse, { to: "string" });
    const framesImageData = JSON.parse(inflated);

    const gameHistory: History = {
      accountPublicKey: gameStatePda.toBase58(),
      createdAt: gameState.createdAt.toNumber(),
      index: gameState.index,
      framesImageData,
      participants: await participantsPromise,
    };

    return gameHistory;
  }
);

const gameStatesSlice = createSlice({
  name: "gameStates",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchHistory.fulfilled, (state, action) => {
      historyAdapter.upsertOne(state, action.payload);
    });
  },
});

export const { selectById: selectHistoryById } =
  historyAdapter.getSelectors<RootState>((state) => state.history);

export default gameStatesSlice.reducer;
