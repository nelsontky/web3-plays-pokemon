import useGameboyMemory from "../hooks/useGameboyMemory";
import usePartyData from "../hooks/usePartyData";

export default function GameState() {
  const gameboyMemory = useGameboyMemory();

  usePartyData(gameboyMemory);
  return null;
}
