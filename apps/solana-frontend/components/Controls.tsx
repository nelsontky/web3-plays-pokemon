import { css } from "@emotion/react";
import { JoypadButton, joypadEnumToButtonId } from "common";
import tw from "twin.macro";
import ControlButton from "./ControlButton";
import { useMutableProgram } from "../hooks/useProgram";
import * as anchor from "@project-serum/anchor";
import { GAME_DATA_ACCOUNT_PUBLIC_KEY } from "../constants";
import useTxSnackbar from "../hooks/useTxSnackbar";
import ControlsBackdrop from "./ControlsBackdrop";

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

  const executeGame = async (joypadButton: JoypadButton) => {
    if (program) {
      const gameDataAccount = await program.account.gameData.fetch(
        GAME_DATA_ACCOUNT_PUBLIC_KEY
      );
      const executedStatesCount = gameDataAccount.executedStatesCount;
      const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
          Buffer.from("game_state"),
          Buffer.from("" + executedStatesCount),
        ],
        program.programId
      );

      const snackbarId = enqueueSnackbar(
        {
          title: "Sending transaction",
        },
        {
          variant: "info",
        }
      );

      try {
        const txId = await program.methods
          .sendButton(joypadEnumToButtonId(joypadButton))
          .accounts({
            gameState: gameStatePda,
            gameData: GAME_DATA_ACCOUNT_PUBLIC_KEY,
            player: anchor.getProvider().publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
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
  );
}
