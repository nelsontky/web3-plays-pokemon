import { Dispatch, SetStateAction } from "react";
import tw from "twin.macro";
import { GAMEBOY_FPS, BUTTON_PRESS_FRAMES, TURBO_AB_PRESS_COUNT } from "common";
import { POKEMON_PIXEL_FONT } from "../constants";
import HelpfulCheckbox from "./HelpfulCheckbox";

interface TurboAbCheckboxProps {
  isTurboMode: boolean;
  setIsTurboMode: Dispatch<SetStateAction<boolean>>;
}

export default function TurboAbCheckbox({
  isTurboMode,
  setIsTurboMode,
}: TurboAbCheckboxProps) {
  return (
    <HelpfulCheckbox
      checked={isTurboMode}
      setChecked={setIsTurboMode}
      helpContent={
        <span className={POKEMON_PIXEL_FONT.className} css={tw`text-base`}>
          Enabling Turbo A/B and voting for A/B will send in a vote to press
          A/B <span css={tw`font-bold`}>{TURBO_AB_PRESS_COUNT} times</span>
        </span>
      }
    >
      Turbo A/B
    </HelpfulCheckbox>
  );
}
