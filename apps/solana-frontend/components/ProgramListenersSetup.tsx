import useGameStateListener from "../hooks/useGameStateListener";
import useSetupGameData from "../hooks/useSetupGameData";
import useSetupGameStates from "../hooks/useSetupGameStates";

export default function ProgramListenersSetup() {
  useSetupGameData();
  useSetupGameStates();
  useGameStateListener();

  return null;
}
