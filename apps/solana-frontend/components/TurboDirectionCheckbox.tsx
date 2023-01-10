import { Dispatch, SetStateAction } from "react";
import tw from "twin.macro";
import { GAMEBOY_FPS, TURBO_DIRECTION_PRESS_FRAMES } from "common";
import { POKEMON_PIXEL_FONT } from "../constants";
import HelpfulCheckbox from "./HelpfulCheckbox";

interface TurboDirectionCheckboxProps {
  isTurboMode: boolean;
  setIsTurboMode: Dispatch<SetStateAction<boolean>>;
}

export default function TurboDirectionCheckbox({
  isTurboMode,
  setIsTurboMode,
}: TurboDirectionCheckboxProps) {
  return (
    <HelpfulCheckbox
      checked={isTurboMode}
      setChecked={setIsTurboMode}
      helpContent={
        <span className={POKEMON_PIXEL_FONT.className} css={tw`text-base`}>
          Enabling Turbo direction and voting for a direction button will send
          in a vote to hold down the direction button for{" "}
          <span css={tw`font-bold`}>
            {TURBO_DIRECTION_PRESS_FRAMES / GAMEBOY_FPS} seconds
          </span>
        </span>
      }
    >
      Turbo direction
    </HelpfulCheckbox>
  );
}
