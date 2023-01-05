import { useEffect } from "react";
import { GAME_DATA_ACCOUNT_PUBLIC_KEY } from "../constants";
import { fetchGameData, setGameData } from "../slices/gameDataSlice";
import { useAppDispatch, useAppSelector } from "./redux";
import { useReadonlyProgram } from "./useProgram";

export default function useSetupGameData() {
  const dispatch = useAppDispatch();

  const program = useReadonlyProgram();
  const status = useAppSelector((state) => state.gameData.status);

  useEffect(
    function fetchGameDataAndSetupListeners() {
      const eventEmitter = program.account.gameData.subscribe(
        GAME_DATA_ACCOUNT_PUBLIC_KEY
      );
      eventEmitter.addListener("change", (account) => {
        dispatch(
          setGameData({
            executedStatesCount: account.executedStatesCount,
            isExecuting: account.isExecuting,
          })
        );
      });

      if (status === "idle") {
        dispatch(fetchGameData(program));
      }

      return () => {
        eventEmitter.removeAllListeners();
      };
    },
    [dispatch, program, status]
  );
}
