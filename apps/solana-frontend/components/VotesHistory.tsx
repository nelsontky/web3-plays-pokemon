import { useEffect, useMemo, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { useReadonlyProgram } from "../hooks/useProgram";
import { GAME_DATA_ACCOUNT_PUBLIC_KEY } from "../constants";

export default function VotesHistory() {
  const program = useReadonlyProgram();
  const [secondsPlayed, setSecondsPlayed] = useState<number>();

  const allGameStatesPdas = useMemo(
    () =>
      secondsPlayed !== undefined
        ? Array.from({ length: secondsPlayed }, (_, i) => {
            const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
              [
                GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
                Buffer.from("game_state"),
                Buffer.from("" + i),
              ],
              program.programId
            );
            return gameStatePda;
          })
        : undefined,
    [secondsPlayed, program]
  );

  useEffect(
    function getSecondsPlayed() {
      (async () => {
        const gameDataAccount = await program.account.gameData.fetch(
          GAME_DATA_ACCOUNT_PUBLIC_KEY
        );
        const secondsPlayed = gameDataAccount.secondsPlayed;
        console.log("secondsPlayed:", secondsPlayed);
        setSecondsPlayed(secondsPlayed);
      })();
    },
    [program.account.gameData]
  );

  useEffect(
    function addCurrentGameStateListener() {
      const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
          Buffer.from("game_state"),
          Buffer.from("" + secondsPlayed),
        ],
        program.programId
      );

      const emitter = program.account.gameState.subscribe(
        gameStatePda,
        "processed"
      );
      emitter.addListener("change", (account) => {
        console.log(account);
      });

      return () => {
        emitter.removeAllListeners();
      };
    },
    [program, secondsPlayed]
  );

  useEffect(
    function fetchAllGameStates() {
      if (allGameStatesPdas) {
        (async () => {
          const result = await program.account.gameState.fetchMultiple(
            allGameStatesPdas
          );
          console.log(result);
        })();
      }
    },
    [allGameStatesPdas, program.account.gameState]
  );

  return null;
}
