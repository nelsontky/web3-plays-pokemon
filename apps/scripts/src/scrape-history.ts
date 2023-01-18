import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { GAME_DATA_ACCOUNT_ID, GAME_DATA_AUTHORITY, PROGRAM_ID } from "common";
import * as process from "process";
import fs from "fs/promises";
import path from "path";

const CHUNK_SIZE = 5;
const FINAL_INDEX_TO_FETCH = 21973;

const GAME_DATA_ACCOUNT_PUBLIC_KEY = new PublicKey(GAME_DATA_ACCOUNT_ID);
const PROGRAM_PUBLIC_KEY = new PublicKey(PROGRAM_ID);

interface SavedData {
  nextIndex: number;
  data: {
    [publicKey: string]: number[];
  };
}

(async () => {
  const savedData: SavedData = JSON.parse(
    (await fs.readFile(path.join(process.cwd(), "saved-data.json"))).toString()
  );
  const { nextIndex } = savedData;

  for (
    let index = nextIndex;
    index <= FINAL_INDEX_TO_FETCH;
    index += CHUNK_SIZE
  ) {
    console.log(`Fetching from index ${index} to ${index + CHUNK_SIZE - 1}`);
    const indexesToFetch = Array.from(
      { length: CHUNK_SIZE },
      (_, i) => i + index
    );

    let done = false;
    while (!done) {
      try {
        const promises = indexesToFetch.map(async (index) => {
          const [gameStatePda] = PublicKey.findProgramAddressSync(
            [
              GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
              Buffer.from("game_state"),
              Buffer.from("" + index),
            ],
            PROGRAM_PUBLIC_KEY
          );

          const participants = await getGameStateParticipants(gameStatePda);
          return {
            index,
            participants: participants.map((participant) => participant.signer),
          };
        });

        const results = await Promise.all(promises);

        for (const result of results) {
          const index = result.index;
          for (const participant of result.participants) {
            if (savedData.data[participant] === undefined) {
              savedData.data[participant] = [index];
            } else {
              savedData.data[participant].push(index);

              // remove duplicates
              savedData.data[participant] = Array.from(
                new Set(savedData.data[participant])
              );
            }
          }
        }

        done = true;
      } catch (e) {
        if (e instanceof Error) {
          console.log(
            `Error occurred: ${e.message}. Waiting for 1 minute before resuming...`
          );
          await new Promise((resolve) => {
            setTimeout(resolve, 1000 * 60);
          });
        }
      }
    }

    savedData.nextIndex = index + CHUNK_SIZE;
    await fs.writeFile(
      path.join(process.cwd(), "saved-data.json"),
      JSON.stringify(savedData)
    );
  }
})();

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

async function getGameStateParticipants(gameStatePda: PublicKey) {
  const response = await axios.get<SolscanData[]>(
    `https://public-api.solscan.io/account/transactions?account=${gameStatePda.toBase58()}&limit=100`,
    { headers: { "Accept-Encoding": "gzip,deflate,compress" } }
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
