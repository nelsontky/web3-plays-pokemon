import { GAMEBOY_CAMERA_HEIGHT, GAMEBOY_CAMERA_WIDTH } from "common";
import { useEffect, useState } from "react";
import tw from "twin.macro";
import Controls from "../components/Controls";
import GameCanvas from "../components/GameCanvas";
import VotesHistory from "../components/VotesHistory";
import { CELL_SIZE } from "../utils/renderFrame";

export default function Web() {
  return (
    <div css={tw`max-w-2xl mx-auto px-4 pb-8`}>
      <GameCanvas />
      <Controls />
      {/* <VotesHistory /> */}
    </div>
  );
}
