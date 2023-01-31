import { Dispatch, SetStateAction, useState } from "react";
import {
  Checkbox,
  ClickAwayListener,
  FormControlLabel,
  FormGroup,
  IconButton,
  Tooltip,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import tw from "twin.macro";
import { POKEMON_PIXEL_FONT } from "../constants";
import HelpTooltip from "./HelpTooltip";

interface HelpfulCheckboxProps {
  checked: boolean;
  setChecked: Dispatch<SetStateAction<boolean>>;
  children: React.ReactNode;
  helpContent: React.ReactNode;
}

export default function HelpfulCheckbox({
  checked,
  setChecked,
  children,
  helpContent,
}: HelpfulCheckboxProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  return (
    <FormGroup css={tw`inline-block`}>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
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
          <div css={tw`flex items-center`}>
            <span css={tw`text-lg`} className={POKEMON_PIXEL_FONT.className}>
              {children}
            </span>
            <HelpTooltip>{helpContent}</HelpTooltip>
          </div>
        }
      />
    </FormGroup>
  );
}
