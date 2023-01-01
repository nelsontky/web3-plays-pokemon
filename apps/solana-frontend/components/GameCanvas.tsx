import { FPS, GAMEBOY_CAMERA_HEIGHT, GAMEBOY_CAMERA_WIDTH } from "common";
import { useEffect, useRef } from "react";
import tw from "twin.macro";
import renderFrame, { CELL_SIZE } from "../utils/renderFrame";
import axios from "axios";
import pako from "pako";
import { useAppSelector } from "../hooks/redux";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>();
  const secondsPlayed = useAppSelector((state) => state.gameData.secondsPlayed);
  const gameStatesStatus = useAppSelector((state) => state.gameStates.status);
  const framesImageToRenderCid = useAppSelector(
    (state) => state.gameStates.framesImageCidToRender
  );

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

          const renderLoop = () => {
            if (canvasRef.current) {
              const frameDataArray = framesImageData.shift();
              const ctx = canvasRef.current.getContext("2d");

              if (ctx && frameDataArray) {
                requestAnimationFrame(renderLoop);

                setTimeout(() => {
                  renderFrame(frameDataArray, ctx);
                }, 1000 / FPS);
              }
            }
          };

          renderLoop();
        })();

        return () => {
          hasUnmounted = true;
        };
      }
    },
    [framesImageToRenderCid, gameStatesStatus]
  );

  return (
    <canvas
      css={tw`mx-auto max-w-full`}
      ref={(node) => {
        if (node && !canvasRef.current) {
          node.height = CELL_SIZE * GAMEBOY_CAMERA_HEIGHT;
          node.width = CELL_SIZE * GAMEBOY_CAMERA_WIDTH;
          canvasRef.current = node;
        }
      }}
    />
  );
}
