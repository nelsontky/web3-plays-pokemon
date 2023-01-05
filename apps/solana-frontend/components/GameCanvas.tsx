import {
  FRAMES_TO_DRAW_PER_EXECUTION,
  GAMEBOY_CAMERA_HEIGHT,
  GAMEBOY_CAMERA_WIDTH,
  NUMBER_OF_SECONDS_TO_EXECUTE_PER_BUTTON_PRESS,
} from "common";
import { useEffect, useRef, useState } from "react";
import tw from "twin.macro";
import renderFrame, { CELL_SIZE } from "../utils/renderFrame";
import axios from "axios";
import pako from "pako";
import { useAppSelector } from "../hooks/redux";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStatesStatus = useAppSelector((state) => state.gameStates.status);
  const framesImageToRenderCid = useAppSelector(
    (state) => state.gameStates.framesImageCidToRender
  );
  const [framesImageData, setFrameImagesData] = useState<number[][]>();

  useEffect(
    function renderFrames() {
      if (
        gameStatesStatus === "succeeded" &&
        framesImageToRenderCid !== undefined &&
        framesImageToRenderCid.length > 0
      ) {
        let hasUnmounted = false;

        (async () => {
          const response = await axios.get(
            `https://${framesImageToRenderCid}.ipfs.cf-ipfs.com`,
            {
              responseType: "arraybuffer",
            }
          );

          if (hasUnmounted) {
            return;
          }

          const inflated = pako.inflate(response.data, { to: "string" });
          const framesImageData: number[][] = JSON.parse(inflated);
          setFrameImagesData(framesImageData);
        })();

        return () => {
          hasUnmounted = true;
        };
      }
    },
    [framesImageToRenderCid, gameStatesStatus]
  );

  useEffect(
    function drawToCanvas() {
      if (framesImageData) {
        let now;
        let then = Date.now();
        const fps = FRAMES_TO_DRAW_PER_EXECUTION / NUMBER_OF_SECONDS_TO_EXECUTE_PER_BUTTON_PRESS;
        let interval = 1000 / fps;
        let delta;

        const renderLoop = () => {
          requestAnimationFrame(renderLoop);

          now = Date.now();
          delta = now - then;

          if (canvasRef.current && delta > interval) {
            then = now - (delta % interval);

            const frameDataArray = framesImageData.shift();
            const ctx = canvasRef.current.getContext("2d");

            if (ctx && frameDataArray) {
              renderFrame(frameDataArray, ctx);
            }
          }
        };

        renderLoop();
      }
    },
    [framesImageData]
  );

  if (framesImageData === undefined) {
    return (
      <div
        css={tw`flex justify-center items-center mx-auto max-w-full aspect-[1.1111/1]`}
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
