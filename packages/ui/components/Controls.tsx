import { css } from "@emotion/react";
import { JoypadButton } from "common";
import tw from "twin.macro";
import ControlButton from "./ControlButton";
import { useMutableProgram } from "../hooks/useProgram";
import * as anchor from "@project-serum/anchor";
import { POKEMON_PIXEL_FONT } from "../constants";
import useTxSnackbar from "../hooks/useTxSnackbar";
import ControlsBackdrop from "./ControlsBackdrop";
import { useState } from "react";
import HelpfulCheckbox from "./HelpfulCheckbox";
import { useConfig } from "../contexts/ConfigProvider";
import { joypadEnumToButtonId } from "../utils/gameUtils";

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

export default function Controls() {
  const program = useMutableProgram();
  const { enqueueSnackbar, closeSnackbar } = useTxSnackbar();
  const [pressCount, setPressCount] = useState<1 | 2>(1);
  const { gameDataAccountPublicKey } = useConfig();

  const executeGame = async (joypadButton: JoypadButton) => {
    if (program) {
      const gameDataAccount = await program.account.gameData.fetch(
        gameDataAccountPublicKey
      );
      const executedStatesCount = gameDataAccount.executedStatesCount;
      const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          gameDataAccountPublicKey.toBuffer(),
          Buffer.from("game_state"),
          Buffer.from("" + executedStatesCount),
        ],
        program.programId
      );
      const [currentParticipantsPda] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("current_participants"),
            gameDataAccountPublicKey.toBuffer(),
          ],
          program.programId
        );

      const snackbarId = enqueueSnackbar(
        {
          title: "Sending transaction",
        },
        {
          variant: "info",
          autoHideDuration: null,
        }
      );

      try {
        const txId = await program.methods
          .sendButton(joypadEnumToButtonId(joypadButton), pressCount)
          .accounts({
            gameState: gameStatePda,
            gameData: gameDataAccountPublicKey,
            player: anchor.getProvider().publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
            currentParticipants: currentParticipantsPda,
          })
          .rpc();

        enqueueSnackbar(
          {
            title: "Success",
            txId,
          },
          {
            variant: "success",
          }
        );
      } catch (e) {
        if (e instanceof Error) {
          enqueueSnackbar(
            {
              title: "Error",
              errorMessage: e.message,
            },
            {
              variant: "error",
            }
          );
        }
      } finally {
        closeSnackbar(snackbarId);
      }
    }
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
