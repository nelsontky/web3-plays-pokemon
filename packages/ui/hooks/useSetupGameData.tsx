import { useEffect } from "react";
import { useConfig } from "../contexts/ConfigProvider";
import { fetchGameData, setGameData } from "../slices/gameDataSlice";
import { useAppDispatch, useAppSelector } from "./redux";
import { useReadonlyProgram } from "./useProgram";

export default function useSetupGameData() {
  const { gameDataAccountPublicKey } = useConfig();
  const dispatch = useAppDispatch();

  const program = useReadonlyProgram();
  const status = useAppSelector((state) => state.gameData.status);

  useEffect(
    function fetchGameDataAndSetupListeners() {
      const eventEmitter = program.account.gameData.subscribe(
        gameDataAccountPublicKey
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
        dispatch(fetchGameData({ program, gameDataAccountPublicKey }));
      }

      return () => {
        eventEmitter.removeAllListeners();
      };
    },
    [dispatch, gameDataAccountPublicKey, program, status]
  );
}
