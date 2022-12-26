import { css } from "@emotion/react";
import tw from "twin.macro";
import ControlButton from "./ControlButton";

const styles = {
  mainButtons: tw`
    flex
    justify-between
    items-end
    gap-5
  `,
  directionalPadContainer: tw`
    inline-block
  `,
  padUpContainer: tw`
    flex
    mb-3
  `,
  padUpNeighbor: tw`
    flex-1
  `,
  menuButtons: [
    tw`
      flex
      justify-center
      mt-16
  `,
    css({
      "@media (min-width: 400px)": {
        "& button": {
          fontSize: "1.5rem",
        },
      },
    }),
  ],
};

export default function Controls() {
  return (
    <div>
      <div css={styles.mainButtons}>
        <div css={styles.directionalPadContainer}>
          <div css={styles.padUpContainer}>
            <div css={styles.padUpNeighbor} />
            <ControlButton>↑</ControlButton>
            <div css={styles.padUpNeighbor} />
          </div>
          <div css={tw`flex`}>
            <ControlButton>←</ControlButton>
            <ControlButton>↓</ControlButton>
            <ControlButton>→</ControlButton>
          </div>
        </div>
        <div>
          <ControlButton>B</ControlButton>
          <ControlButton>A</ControlButton>
        </div>
      </div>
      <div css={styles.menuButtons}>
        <ControlButton>SELECT</ControlButton>
        <ControlButton>DO NOTHING</ControlButton>
        <ControlButton>START</ControlButton>
      </div>
    </div>
  );
}
