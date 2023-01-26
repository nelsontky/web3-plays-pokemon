import * as anchor from "@project-serum/anchor";
import {
  GAME_DATA_COLLECTION_IDS,
  GAME_DATA_ACCOUNT_ID,
  PROGRAM_ID,
} from "common";

export const GAME_DATA_ACCOUNT_PUBLIC_KEY = new anchor.web3.PublicKey(
  GAME_DATA_ACCOUNT_ID
);
export const COLLECTION_PUBLIC_KEY = new anchor.web3.PublicKey(
  GAME_DATA_COLLECTION_IDS[GAME_DATA_ACCOUNT_ID]
);

export const PROGRAM_PUBLIC_KEY = new anchor.web3.PublicKey(PROGRAM_ID);

export const POKEMON_PIXEL_FONT = {
  style: { fontColor: "black" },
  className: "temp",
};

export const SIGNATURE_MESSAGE = `Verify to chat.\n\nClicking "Sign" or "Approve" only means you have proved this wallet is owned by you.\n\nThis request will not trigger any blockchain transactions or generate a fee.`;
export const SIGNATURE_MESSAGE_FOR_ROUNDS = `Verify to load data.\n\nClicking "Sign" or "Approve" only means you have proved this wallet is owned by you.\n\nThis request will not trigger any blockchain transactions or generate a fee.`;
