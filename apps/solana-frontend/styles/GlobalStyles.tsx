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
});

const GlobalStyles = () => (
  <>
    <BaseStyles />
    <Global styles={customStyles} />
  </>
);

export default GlobalStyles;
