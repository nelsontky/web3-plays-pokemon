import { GAMEBOY_CAMERA_HEIGHT, GAMEBOY_CAMERA_WIDTH } from "common/src/constants";
import { JoypadButton } from "common/src/enums";

export const joypadEnumToButtonId = (joypadButton: JoypadButton) =>
  joypadButton === JoypadButton.Up
    ? 1
    : joypadButton === JoypadButton.Down
    ? 2
    : joypadButton === JoypadButton.Left
    ? 3
    : joypadButton === JoypadButton.Right
    ? 4
    : joypadButton === JoypadButton.TurboUp
    ? 5
    : joypadButton === JoypadButton.TurboDown
    ? 6
    : joypadButton === JoypadButton.TurboLeft
    ? 7
    : joypadButton === JoypadButton.TurboRight
    ? 8
    : joypadButton === JoypadButton.A
    ? 9
    : joypadButton === JoypadButton.B
    ? 10
    : joypadButton === JoypadButton.Start
    ? 11
    : joypadButton === JoypadButton.Select
    ? 12
    : joypadButton === JoypadButton.TurboA
    ? 13
    : joypadButton === JoypadButton.TurboB
    ? 14
    : 0;

// render frame
export const CELL_SIZE = 3; // px

const getIndex = (row: number, column: number) => {
  return (row * GAMEBOY_CAMERA_WIDTH + column) * 3;
};

export function renderFrame(
  imageDataArray: number[],
  ctx: CanvasRenderingContext2D
) {
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
}
