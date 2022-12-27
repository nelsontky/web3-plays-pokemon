import { css } from "@emotion/react";
import axios from "axios";
import tw from "twin.macro";
import renderFrame from "../utils/renderFrame";
import ControlButton from "./ControlButton";

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
  const executeGame = () => {
    axios.patch("http://localhost:5000").then((res) => {
      let frame = 0;

      const renderLoop = () => {
        const imageDataArray = res.data[frame++];
        const ctx = canvasRef.getContext("2d");

        if (ctx) {
          renderFrame(imageDataArray, ctx);
        }

        if (frame < 60) {
          requestAnimationFrame(renderLoop);
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
            <ControlButton>↑</ControlButton>
            <div css={styles.padUpNeighbor} />
          </div>
          <div css={tw`flex`}>
            <ControlButton>←</ControlButton>
            <ControlButton>↓</ControlButton>
            <ControlButton>→</ControlButton>
          </div>
        </div>
        <div css={styles.actionButtons}>
          <ControlButton>B</ControlButton>
          <ControlButton>A</ControlButton>
        </div>
      </div>
      <div css={styles.menuButtons}>
        <ControlButton>SELECT</ControlButton>
        <ControlButton onClick={executeGame}>DO NOTHING</ControlButton>
        <ControlButton>START</ControlButton>
      </div>
    </div>
  );
}
