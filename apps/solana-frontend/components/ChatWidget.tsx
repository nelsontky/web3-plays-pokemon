import { Popover, Fab, useTheme, Badge } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useRef, useState } from "react";
import tw from "twin.macro";
import ChatContent from "./ChatContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { POKEMON_PIXEL_FONT } from "../constants";

const styles = {
  root: tw`
    fixed
    bottom-6
    right-6
    z-20
  `,
};

const HIDE_BY_DEFAULT_BREAKPOINT = 1200;

export default function ChatWidget() {
  const fabRef = useRef<HTMLElement>();

  const theme = useTheme();
  const isOpenByDefault = useMediaQuery(
    theme.breakpoints.up(HIDE_BY_DEFAULT_BREAKPOINT)
  );

  const [open, setOpen] = useState(false);

  useEffect(
    function openByDefaultDuringMount() {
      setOpen(isOpenByDefault);
    },
    [isOpenByDefault]
  );

  const handleClick = () => {
    setOpen((wasOpen) => !wasOpen);
  };

  return (
    <div css={styles.root}>
      <Badge
        badgeContent="New!"
        color="error"
        anchorOrigin={{
          horizontal: "left",
          vertical: "top",
        }}
        sx={{
          "& .MuiBadge-badge": {
            zIndex: 1051,
            fontSize: "1.25rem",
            ...POKEMON_PIXEL_FONT.style,
          },
        }}
      >
        <Fab
          css={tw`bg-black hover:bg-black`}
          color="primary"
          onClick={handleClick}
          ref={(instance) => {
            if (instance) {
              fabRef.current = instance;
            }
          }}
        >
          {open ? <CloseIcon /> : <ChatIcon />}
        </Fab>
      </Badge>
      <Popover
        hideBackdrop
        keepMounted
        disableScrollLock
        anchorEl={fabRef.current}
        open={open}
        sx={(theme) => ({
          width: 400,
          height: "min(800px, 80vh)",
          [theme.breakpoints.down("sm")]: {
            width: "100%",
            height: "calc(100% - 70px)",
          },
        })}
        PaperProps={{
          sx: (theme) => ({
            height: "100%",
            boxShadow: "none",
            border: "6px solid #000000",
            borderRadius: 4,
            position: "relative",
            [theme.breakpoints.down("sm")]: {
              maxWidth: "100%",
              top: "0 !important",
              left: "0 !important",
            },
            "& .ChatApp": {
              ...POKEMON_PIXEL_FONT.style,
            },
            "& svg *": {
              color: "#000000",
              fill: "#000000",
            },
            "& div,header": {
              background: "#FFFFFF",
            },
            "& .BackBottom": {
              background: "transparent",
            },
            "& button": {
              fontSize: "1.125rem !important",
              color: "#000000 !important",
            },
            "& .Composer-sendBtn": {
              background: "#000000 !important",
              color: "#FFFFFF !important",
            },
            "& .PullToRefresh-loadMore": {
              color: "#000000",
              textDecoration: "underline",
            },
            "& .Composer-input": {
              caretColor: "#000000",
              fontSize: "1.125rem",
              "&::placeholder": {
                fontSize: "1.125rem",
              },
            },
          }),
        }}
      >
        <ChatContent setOpen={setOpen} />
      </Popover>
    </div>
  );
}
