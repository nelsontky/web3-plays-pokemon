import { Popover, Fab, useTheme } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { useEffect, useRef, useState } from "react";
import tw from "twin.macro";
import ChatContent from "./ChatContent";
import useMediaQuery from "@mui/material/useMediaQuery";

const styles = {
  root: tw`
    fixed
    bottom-6
    right-6
  `,
};

const MOBILE_BREAKPOINT = 420;
const HIDE_BY_DEFAULT_BREAKPOINT = 800;

export default function ChatWidget() {
  const fabRef = useRef<HTMLElement>();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(MOBILE_BREAKPOINT));
  const isOpenByDefault = useMediaQuery(
    theme.breakpoints.up(HIDE_BY_DEFAULT_BREAKPOINT)
  );

  const [open, setOpen] = useState(false);

  useEffect(
    function openByDefault() {
      setOpen(isOpenByDefault);
    },
    [isOpenByDefault]
  );

  const handleClick = () => {
    setOpen((wasOpen) => !wasOpen);
  };

  return (
    <div css={styles.root}>
      <Fab
        css={tw`bg-black hover:bg-black z-20`}
        color="primary"
        onClick={handleClick}
        ref={(instance) => {
          if (instance) {
            fabRef.current = instance;
          }
        }}
      >
        <ChatIcon />
      </Fab>
      <Popover
        disableScrollLock={!isMobile}
        anchorEl={fabRef.current}
        open={open}
        PaperProps={{
          sx: {
            width: 400,
            height: "min(800px, 80vh)",
            "@media (max-width: 420px)": {
              height: "100%",
              width: "100%",
              maxWidth: "none",
              maxHeight: "none",
              top: "0 !important",
              left: "0 !important",
            },
          },
        }}
      >
        <ChatContent />
      </Popover>
    </div>
  );
}
