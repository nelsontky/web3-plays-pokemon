import { useAppSelector } from "./redux";
import useGameStateCidData from "./useGameStateCidData";

export default function useGameboyMemory() {
  const currentSaveStateCid = useAppSelector(
    (state) => state.gameStates.currentSaveStateCid
  );
  const saveState = useGameStateCidData<{ gameboyMemory: Uint8Array }>(
    currentSaveStateCid
  );

  return saveState?.gameboyMemory;
}
