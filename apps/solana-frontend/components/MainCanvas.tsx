import { useAppSelector } from "../hooks/redux";
import useGameStateCidData from "../hooks/useGameStateCidData";
import GameCanvas from "./GameCanvas";

export default function MainCanvas() {
  const framesImageToRenderCid = useAppSelector(
    (state) => state.gameStates.framesImageCidToRender
  );
  const framesImageData = useGameStateCidData<number[][]>(
    framesImageToRenderCid
  );

  return <GameCanvas framesImageData={framesImageData} />;
}
