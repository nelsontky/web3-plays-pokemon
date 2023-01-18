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
    `https://public-api.solscan.io/account/transactions?account=${gameStatePda.toBase58()}&limit=100`
  );

  const participants: Participant[] = response.data
    .filter((solscanData) => solscanData.status === "Success") // only include successful transactions
    .filter(
      (_, i, arr) =>
        i >
        arr.findIndex(
          (solScanData) => solScanData.signer[0] === GAME_DATA_AUTHORITY
        )
    ) // only include entries after the latest account creation tx
    .filter(
      (solScanData, i, arr) =>
        !(i === arr.length - 1 && solScanData.signer[0] === GAME_DATA_AUTHORITY)
    ) // exclude earliest account creation tx
    .map((solscanData) => ({
      signer: solscanData.signer[0],
      txHash: solscanData.txHash,
      blockTime: solscanData.blockTime,
    }));

  return participants;
}
