import { debounce } from "lodash";
import { useCallback, useEffect } from "react";
import { fetchHistory, selectHistoryById } from "../slices/historySlice";
import { useAppDispatch, useAppSelector } from "./redux";
import { useReadonlyProgram } from "./useProgram";

export default function useGameHistory(gameStateIndex: number | undefined) {
  const program = useReadonlyProgram();
  const dispatch = useAppDispatch();

  const history = useAppSelector((state) =>
    gameStateIndex === undefined
      ? undefined
      : selectHistoryById(state, gameStateIndex)
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchState = useCallback(
    debounce((gameStateIndex: number) => {
      dispatch(fetchHistory({ program: program, index: gameStateIndex }));
    }, 500),
    []
  );

  useEffect(() => {
    if (history === undefined && gameStateIndex !== undefined) {
      fetchState(gameStateIndex);
    }
  }, [fetchState, gameStateIndex, history]);

  return history;
}
