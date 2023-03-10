import {
  FRAMES_TO_DRAW_PER_EXECUTION,
  GAMEBOY_CAMERA_HEIGHT,
  GAMEBOY_CAMERA_WIDTH,
} from "common";
import { CELL_SIZE, renderFrame } from "../utils/gameUtils";
import { useEffect, useRef } from "react";
import tw from "twin.macro";

const ANIMATION_DURATION = 3; // run game for 3 seconds

interface GameCanvasProps {
  framesImageData: number[][] | undefined;
}

export default function GameCanvas({ framesImageData }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(
    function drawToCanvas() {
      if (framesImageData) {
        let hasUnmounted = false;

        const framesImageDataCopy = [...framesImageData];

        let now;
        let then = Date.now();
        const fps = FRAMES_TO_DRAW_PER_EXECUTION / ANIMATION_DURATION;
        let interval = 1000 / fps;
        let delta;

        const renderLoop = () => {
          if (!hasUnmounted) {
            requestAnimationFrame(renderLoop);
          }

          now = Date.now();
          delta = now - then;

          if (canvasRef.current && delta > interval) {
            then = now - (delta % interval);

            const frameDataArray = framesImageDataCopy.shift();
            const ctx = canvasRef.current.getContext("2d");

            if (ctx && frameDataArray) {
              renderFrame(frameDataArray, ctx);
            }
          }
        };

        renderLoop();

        return () => {
          hasUnmounted = true;
        };
      }
    },
    [framesImageData]
  );

  if (framesImageData === undefined) {
    return (
      <div
        css={tw`flex justify-center items-center mx-auto max-w-full aspect-[1.1111/1] flex-1`}
        style={{
          maxWidth: CELL_SIZE * GAMEBOY_CAMERA_WIDTH,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <canvas
      css={tw`mx-auto max-w-full`}
      ref={canvasRef}
      width={CELL_SIZE * GAMEBOY_CAMERA_WIDTH}
      height={CELL_SIZE * GAMEBOY_CAMERA_HEIGHT}
    />
  );
}
