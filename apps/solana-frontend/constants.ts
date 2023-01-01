import * as anchor from "@project-serum/anchor";
import { GAME_DATA_ACCOUNT_ID, PROGRAM_ID } from "common";

export const GAME_DATA_ACCOUNT_PUBLIC_KEY = new anchor.web3.PublicKey(
  GAME_DATA_ACCOUNT_ID
);

export const PROGRAM_PUBLIC_KEY = new anchor.web3.PublicKey(PROGRAM_ID);
