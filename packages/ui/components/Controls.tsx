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
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios, { AxiosError } from "axios";
import { useAppSelector } from "../hooks/redux";
import { PublicKey } from "@solana/web3.js";
import { SnackbarKey } from "notistack";
import confirmGaslessTransaction from "../utils/confirmGaslessTransaction";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import SelectGasCurrency from "./SelectGasCurrency";

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
  const { publicKey, sendTransaction } = useWallet();
  const { enqueueSnackbar, closeSnackbar } = useTxSnackbar();
  const [pressCount, setPressCount] = useState<1 | 2>(1);
  const { gameDataAccountPublicKey } = useConfig();
  const executedStatesCount = useAppSelector(
    (state) => state.gameData.executedStatesCount
  );
  const { connection } = useConnection();
  const selectedGasCurrency = useAppSelector((state) => state.gasCurrency);

  const executeGame = async (joypadButton: JoypadButton) => {
    if (program && publicKey) {
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
        let txId: string;
        if (selectedGasCurrency === null) {
          txId = await program.methods
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
        } else {
          const response = await axios.post(
            process.env.NODE_ENV === "development"
              ? "http://localhost:3000/api/gasless-transactions/send-button"
              : "https://red.playspokemon.xyz/api/gasless-transactions/send-button",
            {
              publicKey: publicKey.toBase58(),
              gameDataAccountId: gameDataAccountPublicKey.toBase58(),
              buttonId: joypadEnumToButtonId(joypadButton) /*13*/,
              splMint: selectedGasCurrency,
              isTurbo: pressCount === 2,
            }
          );
          const recoveredTransaction = anchor.web3.Transaction.from(
            Buffer.from(response.data.result, "base64")
          );
          const splGasSourceTokenAccount = getAssociatedTokenAddressSync(
            new PublicKey(selectedGasCurrency),
            publicKey
          );
          const confirmGaslessTransactionPromise = confirmGaslessTransaction(
            connection,
            splGasSourceTokenAccount
          );
          const { blockhash, lastValidBlockHeight } =
            await connection.getLatestBlockhash();
          txId = await sendTransaction(recoveredTransaction, connection, {
            skipPreflight: true,
          });
          const status = await connection.confirmTransaction({
            blockhash: blockhash,
            lastValidBlockHeight,
            signature: txId,
          });
          await confirmGaslessTransactionPromise;

          if (status.value.err) {
            throw new Error(
              `Transaction failed: ${JSON.stringify(status.value)}`
            );
          }
        }

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
      <div css={tw`flex justify-between items-center`}>
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
        <SelectGasCurrency />
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
