import { useEffect, useMemo, useRef } from "react";
import { upsertGameState } from "../slices/gameStatesSlice";
import { useAppDispatch, useAppSelector } from "./redux";
import { useReadonlyProgram } from "./useProgram";
import * as anchor from "@project-serum/anchor";
import { GAME_DATA_ACCOUNT_PUBLIC_KEY, PROGRAM_PUBLIC_KEY } from "../constants";
import usePrevious from "./usePrevious";
import { anchorEnumToJsEnum } from "common";

export default function useGameStateListener() {
  const dispatch = useAppDispatch();
  const program = useReadonlyProgram();

  const gameStatesStatus = useAppSelector((state) => state.gameStates.status);
  const executedStatesCount = useAppSelector(
    (state) => state.gameData.executedStatesCount
  );
  const gameStatePda = useMemo(() => {
    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + executedStatesCount),
      ],
      PROGRAM_PUBLIC_KEY
    );
    return pda;
  }, [executedStatesCount]);

  const gameStatePdaPrev = usePrevious(gameStatePda);
  const didGameStatePdaChange =
    gameStatePdaPrev?.toBase58() !== gameStatePda.toBase58();
  const isInitialSetup = useRef(true);

  useEffect(
    function setupListener() {
      if (
        gameStatesStatus === "succeeded" &&
        (didGameStatePdaChange || isInitialSetup.current)
      ) {
        const emitter = program.account.gameState.subscribe(
          new anchor.web3.PublicKey(gameStatePda)
        );

        emitter.addListener("change", (account: any) => {
          if (account) {
            dispatch(
              upsertGameState({
                ...account,
                accountPublicKey: gameStatePda.toBase58(),
                createdAt: account.createdAt.toNumber(),
                executedButton: anchorEnumToJsEnum(account.executedButton),
              })
            );

            if (account.framesImageCid.length > 0) {
              emitter.removeAllListeners();
            }
          }
        });
        isInitialSetup.current = false;
      }
    },
    [
      dispatch,
      gameStatesStatus,
      gameStatePda,
      program.account.gameState,
      gameStatePdaPrev,
      didGameStatePdaChange,
    ]
  );

  useEffect(
    function fetchNewState() {
      if (gameStatesStatus === "succeeded" && didGameStatePdaChange) {
        let hasUnmounted = false;

        (async () => {
          try {
            const gameState = await program.account.gameState.fetch(
              gameStatePda
            );
            if (!hasUnmounted) {
              dispatch(
                upsertGameState({
                  ...gameState,
                  accountPublicKey: gameStatePda.toBase58(),
                  createdAt: gameState.createdAt.toNumber(),
                  executedButton: anchorEnumToJsEnum(gameState.executedButton),
                })
              );
            }
          } catch {
            // ignore any errors of account not existing
          }
        })();

        return () => {
          hasUnmounted = true;
        };
      }
    },
    [
      dispatch,
      gameStatesStatus,
      gameStatePda,
      program.account.gameState,
      gameStatePdaPrev,
      didGameStatePdaChange,
    ]
  );
}
