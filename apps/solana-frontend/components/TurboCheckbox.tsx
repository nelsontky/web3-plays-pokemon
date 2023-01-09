import { Dispatch, SetStateAction } from "react";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Tooltip,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import tw from "twin.macro";
import {
  GAMEBOY_FPS,
  NUMBER_OF_SECONDS_TO_EXECUTE_PER_BUTTON_PRESS,
  TURBO_BUTTON_PRESS_FRAMES,
} from "common";
import { POKEMON_PIXEL_FONT } from "../constants";

interface TurboCheckboxProps {
  isTurboMode: boolean;
  setIsTurboMode: Dispatch<SetStateAction<boolean>>;
}

export default function TurboCheckbox({
  isTurboMode,
  setIsTurboMode,
}: TurboCheckboxProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsTurboMode(event.target.checked);
  };

  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox
            checked={isTurboMode}
            onChange={handleChange}
            sx={{
              color: "#000000",
              "&.Mui-checked": {
                color: "#000000",
              },
            }}
          />
        }
        label={
          <div>
            <span css={tw`text-lg`} className={POKEMON_PIXEL_FONT.className}>
              Turbo direction
            </span>
            <Tooltip
              title={
                <span
                  className={POKEMON_PIXEL_FONT.className}
                  css={tw`text-base`}
                >
                  Enabling Turbo direction and voting for a direction button
                  will send in a vote to hold down the direction button for{" "}
                  <span css={tw`font-bold`}>
                    {TURBO_BUTTON_PRESS_FRAMES / GAMEBOY_FPS} seconds
                  </span>
                </span>
              }
              placement="top"
            >
              <IconButton size="small">
                <HelpOutlineIcon
                  sx={{
                    color: "#000000",
                  }}
                  fontSize="small"
                />
              </IconButton>
            </Tooltip>
          </div>
        }
      />
    </FormGroup>
  );
}
