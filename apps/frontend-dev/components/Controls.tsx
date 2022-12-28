import { css } from "@emotion/react";
import axios from "axios";
import { FPS, JoypadButton } from "common";
import tw from "twin.macro";
import renderFrame from "../utils/renderFrame";
import ControlButton from "./ControlButton";
import { inflate } from "pako";

const styles = {
  root: tw`
    mt-8
  `,
  mainButtons: tw`
    flex
    justify-between
    items-end
    gap-5
  `,
  actionButtons: tw`
    flex
    flex-wrap
    justify-end
  `,
  directionalPadContainer: tw`
    inline-block
  `,
  padUpContainer: tw`
    flex
    mb-3
  `,
  padUpNeighbor: tw`
    flex-1
  `,
  menuButtons: [
    tw`
      flex
      justify-center
      mt-16
  `,
    css({
      "@media (min-width: 400px)": {
        "& button": {
          fontSize: "1.5rem",
        },
      },
    }),
  ],
};

interface ControlsProps {
  canvasRef: HTMLCanvasElement;
}

export default function Controls({ canvasRef }: ControlsProps) {
  const executeGame = (joypadButton: JoypadButton) => {
    axios
      .patch(
        "http://localhost:5000",
        { joypadButton },
        { responseType: "arraybuffer" }
      )
      .then((res) => {
        const imageDataArrays: number[][] = JSON.parse(
          inflate(res.data, { to: "string" })
        );

        const renderLoop = () => {
          const imageDataArray = imageDataArrays.shift();
          const ctx = canvasRef.getContext("2d");

          if (ctx && imageDataArray) {
            requestAnimationFrame(renderLoop);

            setTimeout(() => {
              renderFrame(imageDataArray, ctx);
            }, 1000 / FPS);
          }
        };

        renderLoop();
      });
  };

  return (
    <div css={styles.root}>
      <div css={styles.mainButtons}>
        <div css={styles.directionalPadContainer}>
          <div css={styles.padUpContainer}>
            <div css={styles.padUpNeighbor} />
            <ControlButton
              onClick={() => {
                executeGame(JoypadButton.Up);
              }}
            >
              ↑
            </ControlButton>
            <div css={styles.padUpNeighbor} />
          </div>
          <div css={tw`flex`}>
            <ControlButton
              onClick={() => {
                executeGame(JoypadButton.Left);
              }}
            >
              ←
            </ControlButton>
            <ControlButton
              onClick={() => {
                executeGame(JoypadButton.Down);
              }}
            >
              ↓
            </ControlButton>
            <ControlButton
              onClick={() => {
                executeGame(JoypadButton.Right);
              }}
            >
              →
            </ControlButton>
          </div>
        </div>
        <div css={styles.actionButtons}>
          <ControlButton
            onClick={() => {
              executeGame(JoypadButton.B);
            }}
          >
            B
          </ControlButton>
          <ControlButton
            onClick={() => {
              executeGame(JoypadButton.A);
            }}
          >
            A
          </ControlButton>
        </div>
      </div>
      <div css={styles.menuButtons}>
        <ControlButton
          onClick={() => {
            executeGame(JoypadButton.Select);
          }}
        >
          SELECT
        </ControlButton>
        <ControlButton
          onClick={() => {
            executeGame(JoypadButton.Nothing);
          }}
        >
          DO NOTHING
        </ControlButton>
        <ControlButton
          onClick={() => {
            executeGame(JoypadButton.Start);
          }}
        >
          START
        </ControlButton>
      </div>
    </div>
  );
}
