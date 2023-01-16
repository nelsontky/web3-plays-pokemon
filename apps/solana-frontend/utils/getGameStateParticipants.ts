import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { GAME_DATA_AUTHORITY } from "common";

interface SolscanData {
  blockTime: number;
  slot: number;
  txHash: string;
  fee: number;
  status: string;
  lamport: number;
  signer: string[];
}

export interface Participant {
  signer: string;
  txHash: string;
  blockTime: number;
}

export default async function getGameStateParticipants(
  gameStatePda: PublicKey
) {
  const response = await axios.get<SolscanData[]>(
    `https://public-api.solscan.io/account/transactions?account=${gameStatePda.toBase58()}&limit=20`
  );

  const participants: Participant[] = response.data
    .filter(
      (solscanData) =>
        solscanData.status === "Success" &&
        solscanData.signer[0] !== GAME_DATA_AUTHORITY
    )
    .map((solscanData) => ({
      signer: solscanData.signer[0],
      txHash: solscanData.txHash,
      blockTime: solscanData.blockTime,
    }));

  return participants;
}