import { useEffect } from "react";
import {
  selectGameStateById,
  upsertGameState,
} from "../slices/gameStatesSlice";
import { useAppDispatch, useAppSelector } from "./redux";
import { useReadonlyProgram } from "./useProgram";
import * as anchor from "@project-serum/anchor";

export default function useGameStateListener() {
  const dispatch = useAppDispatch();
  const program = useReadonlyProgram();

  const gameStatesStatus = useAppSelector((state) => state.gameStates.status);
  const secondsPlayed = useAppSelector((state) => state.gameData.secondsPlayed);
  const gameStatePda = useAppSelector(
    (state) => selectGameStateById(state, secondsPlayed)?.accountPublicKey
  );

  useEffect(
    function setupListener() {
      if (gameStatesStatus === "succeeded" && gameStatePda !== undefined) {
        const emitter = program.account.gameState.subscribe(
          new anchor.web3.PublicKey(gameStatePda)
        );
        emitter.addListener("change", (account) => {
          if (account) {
            dispatch(
              upsertGameState({
                ...account,
                accountPublicKey: gameStatePda,
                createdAt: account.createdAt.toNumber(),
              })
            );
          }
        });

        return () => {
          emitter.removeAllListeners();
        };
      }
    },
    [dispatch, gameStatesStatus, gameStatePda, program.account.gameState]
  );
}
