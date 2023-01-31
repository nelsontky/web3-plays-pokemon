import { ClickAwayListener, Tooltip, IconButton } from "@mui/material";
import { POKEMON_PIXEL_FONT } from "common";
import { useState } from "react";
import tw from "twin.macro";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

interface HelpTooltipProps {
  children: React.ReactNode;
}

export default function HelpTooltip({ children }: HelpTooltipProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const handleTooltipClose = () => {
    setTooltipOpen(false);
  };

  const handleTooltipOpen = () => {
    setTooltipOpen(true);
  };

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <div>
        <Tooltip
          disableTouchListener
          PopperProps={{
            disablePortal: true,
          }}
          onClose={handleTooltipClose}
          onOpen={handleTooltipOpen}
          open={tooltipOpen}
          title={
            <span className={POKEMON_PIXEL_FONT.className} css={tw`text-base`}>
              {children}
            </span>
          }
          placement="top"
        >
          <IconButton
            size="small"
            onClick={() => {
              setTooltipOpen((open) => !open);
            }}
          >
            <HelpOutlineIcon
              sx={{
                color: "#000000",
              }}
              fontSize="small"
            />
          </IconButton>
        </Tooltip>
      </div>
    </ClickAwayListener>
  );
}
