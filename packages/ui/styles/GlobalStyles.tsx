import React from "react";
import { GlobalStyles as BaseStyles } from "twin.macro";
import { Global } from "@emotion/react";
import { css } from "@emotion/react";
import { POKEMON_PIXEL_FONT } from "../constants";

const customStyles = css({
  html: {
    height: "100%",
  },
  body: {
    ...POKEMON_PIXEL_FONT.style,
    background: "#ffffff",
    height: "100%",
  },
  "div#__next": {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  ".custom-snackbar-root": {
    "&& > .SnackbarContent-root": {
      background: "#ffffff",
      color: "#000000",
      boxShadow: "none",
      border: "2px solid #000000",
      fontSize: "1rem",
      ...POKEMON_PIXEL_FONT.style,
    },
    "&& .SnackbarItem-message": {
      display: "flex",
      gap: 12,
    },
    "& .MuiSvgIcon-root": {
      marginInlineEnd: "0px !important",
    },
  },
});

const GlobalStyles = () => (
  <>
    <BaseStyles />
    <Global styles={customStyles} />
  </>
);

export default GlobalStyles;
