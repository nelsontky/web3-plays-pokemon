import * as anchor from "@project-serum/anchor";
import { GAME_DATA_ACCOUNT_ID } from "common";

export const GAME_DATA_ACCOUNT_PUBLIC_KEY = new anchor.web3.PublicKey(
  GAME_DATA_ACCOUNT_ID
);
