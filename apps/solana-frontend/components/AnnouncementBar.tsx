import tw from "twin.macro";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import { useState } from "react";

const styles = {
  root: tw`
    py-1
    px-2
    text-center
    leading-none
    bg-black
    text-white
    flex
    justify-between
    items-center
    text-lg
  `,
  spacer: tw`
    w-[30px]
  `,
  content: tw`
    flex-1
  `,
};

const CONTENT = (
  <span>
    If you like NFTs and Pokemon do check out Bitmon{" "}
    <a
      css={tw`underline`}
      href="https://bitmon.io/"
      target="_blank"
      rel="noreferrer"
    >
      here
    </a>{" "}
    :&#41;
  </span>
);

export default function AnnouncementBar() {
  const [open, setOpen] = useState(true);

  return (
    <div css={[styles.root, !open && tw`hidden`]}>
      <div css={styles.spacer} />
      <div css={styles.content}>{CONTENT}</div>
      <IconButton
        onClick={() => {
          setOpen(false);
        }}
        size="small"
      >
        <CloseIcon
          fontSize="small"
          sx={{
            color: "#FFFFFF",
          }}
        />
      </IconButton>
    </div>
  );
}
