import { useEffect } from "react";
import { useConfig } from "../contexts/ConfigProvider";
import { fetchInitialGameStates } from "../slices/gameStatesSlice";
import { useAppDispatch, useAppSelector } from "./redux";
import { useReadonlyProgram } from "./useProgram";

export default function useSetupGameStates() {
  const { gameDataAccountPublicKey } = useConfig();
  const dispatch = useAppDispatch();

  const program = useReadonlyProgram();
  const gameStatesStatus = useAppSelector((state) => state.gameStates.status);

  const gameDataStatus = useAppSelector((state) => state.gameData.status);
  const secondsPlayed = useAppSelector(
    (state) => state.gameData.executedStatesCount
  );

  useEffect(
    function fetchGameStates() {
      if (gameStatesStatus === "idle" && gameDataStatus === "succeeded") {
        dispatch(
          fetchInitialGameStates({
            program,
            secondsPlayed,
            gameDataAccountPublicKey,
          })
        );
      }
    },
    [
      dispatch,
      program,
      gameStatesStatus,
      gameDataStatus,
      secondsPlayed,
      gameDataAccountPublicKey,
    ]
  );
}
