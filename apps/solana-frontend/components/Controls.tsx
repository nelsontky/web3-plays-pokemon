import { css } from "@emotion/react";
import { JoypadButton, joypadEnumToButtonId } from "common";
import tw from "twin.macro";
import ControlButton from "./ControlButton";
import { useMutableProgram } from "../hooks/useProgram";
import * as anchor from "@project-serum/anchor";
import { GAME_DATA_ACCOUNT_PUBLIC_KEY, POKEMON_PIXEL_FONT } from "../constants";
import useTxSnackbar from "../hooks/useTxSnackbar";
import ControlsBackdrop from "./ControlsBackdrop";
import { Dispatch, SetStateAction, useState } from "react";
import HelpfulCheckbox from "./HelpfulCheckbox";
import axios from "axios";

const styles = {
  root: tw`
    relative
    p-2
    pr-4
    pb-4
  `,
  mainButtons: tw`
    flex
    justify-between
    items-end
    gap-5
  `,
  actionButtons: tw`
    flex
    flex-wrap
    justify-end
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
      mt-8
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

export default function Controls({
  setFramesImageData,
}: {
  setFramesImageData: Dispatch<SetStateAction<number[][] | undefined>>;
}) {
  const program = useMutableProgram();
  const { enqueueSnackbar, closeSnackbar } = useTxSnackbar();
  const [pressCount, setPressCount] = useState<1 | 2>(1);

  const executeGame = async (joypadButton: JoypadButton) => {
    const response = await axios.patch("http://localhost:5000/", {
      joypadButton,
    });
    setFramesImageData(response.data);
  };

  return (
    <>
      <div>
        <HelpfulCheckbox
          checked={pressCount === 2}
          setChecked={(isChecked) => {
            if (isChecked) {
              setPressCount(2);
            } else {
              setPressCount(1);
            }
          }}
          helpContent={
            <span className={POKEMON_PIXEL_FONT.className} css={tw`text-base`}>
              Enabling Turbo mode will send in 2 button presses per click
            </span>
          }
        >
          Turbo mode
        </HelpfulCheckbox>
      </div>
      <div css={styles.root}>
        <ControlsBackdrop />
        <div css={styles.mainButtons}>
          <div css={styles.directionalPadContainer}>
            <div css={styles.padUpContainer}>
              <div css={styles.padUpNeighbor} />
              <ControlButton
                onClick={() => {
                  executeGame(JoypadButton.Up);
                }}
              >
                ↑
              </ControlButton>
              <div css={styles.padUpNeighbor} />
            </div>
            <div css={tw`flex`}>
              <ControlButton
                onClick={() => {
                  executeGame(JoypadButton.Left);
                }}
              >
                ←
              </ControlButton>
              <ControlButton
                onClick={() => {
                  executeGame(JoypadButton.Down);
                }}
              >
                ↓
              </ControlButton>
              <ControlButton
                onClick={() => {
                  executeGame(JoypadButton.Right);
                }}
              >
                →
              </ControlButton>
            </div>
          </div>
          <div css={styles.actionButtons}>
            <ControlButton
              onClick={() => {
                executeGame(JoypadButton.B);
              }}
            >
              B
            </ControlButton>
            <ControlButton
              onClick={() => {
                executeGame(JoypadButton.A);
              }}
            >
              A
            </ControlButton>
          </div>
        </div>
        <div css={styles.menuButtons}>
          <ControlButton
            onClick={() => {
              executeGame(JoypadButton.Select);
            }}
          >
            SELECT
          </ControlButton>
          <ControlButton
            onClick={() => {
              executeGame(JoypadButton.Nothing);
            }}
          >
            DO NOTHING
          </ControlButton>
          <ControlButton
            onClick={() => {
              executeGame(JoypadButton.Start);
            }}
          >
            START
          </ControlButton>
        </div>
      </div>
    </>
  );
}
