import { GAMEBOY_CAMERA_HEIGHT, GAMEBOY_CAMERA_WIDTH } from "common";
import { useEffect, useState } from "react";
import tw from "twin.macro";
import Controls from "../components/Controls";
import { CELL_SIZE } from "../utils/renderFrame";

export default function Web() {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  useEffect(
    function setCanvasDimensions() {
      if (canvasRef) {
        canvasRef.height = CELL_SIZE * GAMEBOY_CAMERA_HEIGHT;
        canvasRef.width = CELL_SIZE * GAMEBOY_CAMERA_WIDTH;
      }
    },
    [canvasRef]
  );

  return (
    <div css={tw`max-w-2xl mx-auto px-4 pb-8`}>
      <canvas css={tw`mx-auto`} ref={setCanvasRef} />
      {!!canvasRef && <Controls canvasRef={canvasRef} />}
    </div>
  );
}
