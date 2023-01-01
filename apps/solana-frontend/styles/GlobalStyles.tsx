import React from "react";
import { GlobalStyles as BaseStyles } from "twin.macro";
import { Global } from "@emotion/react";
import localFont from "@next/font/local";
import { css } from "@emotion/react";

const pokemonPixelFont = localFont({ src: "../fonts/pokemon_pixel_font.woff" });

const customStyles = css({
  body: {
    ...pokemonPixelFont.style,
  },
  ".custom-snackbar-root": {
    "&& > .SnackbarContent-root": {
      background: "#ffffff",
      color: "#000000",
      boxShadow: "none",
      border: "2px solid #000000",
      fontSize: "1.25rem",
      ...pokemonPixelFont.style,
    },
    "&& .SnackbarItem-message": {
      display: "flex",
      gap: 12
    }
  },
});

const GlobalStyles = () => (
  <>
    <BaseStyles />
    <Global styles={customStyles} />
  </>
);

export default GlobalStyles;
