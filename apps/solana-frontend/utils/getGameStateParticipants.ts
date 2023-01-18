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
    .filter((solscanData, i, arr) => {
      const isCreateAccountTx =
        (i === 0 || i === arr.length - 1) &&
        solscanData.signer[0] === GAME_DATA_AUTHORITY;
      return solscanData.status === "Success" && !isCreateAccountTx;
    })
    .map((solscanData) => ({
      signer: solscanData.signer[0],
      txHash: solscanData.txHash,
      blockTime: solscanData.blockTime,
    }));

  return participants;
}
