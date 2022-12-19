import { useEffect, useRef } from "react";
import axios from "axios";

const CELL_SIZE = 4; // px
const GAMEBOY_CAMERA_WIDTH = 160;
const GAMEBOY_CAMERA_HEIGHT = 144;

const getIndex = (row: number, column: number) => {
  return row * GAMEBOY_CAMERA_WIDTH + column;
};

const drawCells = (cells: string[], ctx: CanvasRenderingContext2D) => {
  ctx.beginPath();

  for (let row = 0; row < GAMEBOY_CAMERA_HEIGHT; row++) {
    for (let col = 0; col < GAMEBOY_CAMERA_WIDTH; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = cells[idx];

      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  ctx.stroke();
};

export default function Web() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.height = (CELL_SIZE + 1) * GAMEBOY_CAMERA_HEIGHT + 1;
      canvas.width = (CELL_SIZE + 1) * GAMEBOY_CAMERA_WIDTH + 1;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        axios.patch("http://localhost:5000").then((res) => {
          drawCells(res.data, ctx);
        });
      }
    }
  }, []);

  return (
    <div>
      <h1>Hello world</h1>
      <canvas ref={canvasRef} />
    </div>
  );
}
