import { GAMEBOY_CAMERA_HEIGHT, GAMEBOY_CAMERA_WIDTH } from "common";

export const CELL_SIZE = 3; // px

const getIndex = (row: number, column: number) => {
  return (row * GAMEBOY_CAMERA_WIDTH + column) * 3;
};

const renderFrame = (
  imageDataArray: string[],
  ctx: CanvasRenderingContext2D
) => {
  ctx.beginPath();

  for (let row = 0; row < GAMEBOY_CAMERA_HEIGHT; row++) {
    for (let col = 0; col < GAMEBOY_CAMERA_WIDTH; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = `rgba(${imageDataArray[idx]}, ${
        imageDataArray[idx + 1]
      },${imageDataArray[idx + 2]}, 255)`;

      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  ctx.stroke();
};

export default renderFrame;
