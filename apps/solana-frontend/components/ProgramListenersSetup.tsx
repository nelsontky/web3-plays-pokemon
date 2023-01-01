import useSetupGameData from "../hooks/useSetupGameData";
import useSetupGameStates from "../hooks/useSetupGameStates";

export default function ProgramListenersSetup() {
  useSetupGameData();
  useSetupGameStates();

  return null;
}
