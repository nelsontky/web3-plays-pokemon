import { css } from "@emotion/react";
import axios from "axios";
import { FPS, GAME_DATA_ACCOUNT_ID, JoypadButton } from "common";
import tw from "twin.macro";
import renderFrame from "../utils/renderFrame";
import ControlButton from "./ControlButton";
import { inflate } from "pako";
import { useMutableProgram } from "../hooks/useProgram";
import * as anchor from "@project-serum/anchor";
import { GAME_DATA_ACCOUNT_PUBLIC_KEY } from "../constants";

const styles = {
  root: tw`
    mt-8
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
  const program = useMutableProgram();
  // const executeGame = (joypadButton: JoypadButton) => {
  //   axios
  //     .patch(
  //       "http://localhost:5000",
  //       { joypadButton },
  //       { responseType: "arraybuffer" }
  //     )
  //     .then((res) => {
  //       const imageDataArrays: number[][] = JSON.parse(
  //         inflate(res.data, { to: "string" })
  //       );

  //       const renderLoop = () => {
  //         const imageDataArray = imageDataArrays.shift();
  //         const ctx = canvasRef.getContext("2d");

  //         if (ctx && imageDataArray) {
  //           requestAnimationFrame(renderLoop);

  //           setTimeout(() => {
  //             renderFrame(imageDataArray, ctx);
  //           }, 1000 / FPS);
  //         }
  //       };

  //       renderLoop();
  //     });
  // };

  const executeGame = async (joypadButton: JoypadButton) => {
    if (program) {
      const gameDataAccount = await program.account.gameData.fetch(
        GAME_DATA_ACCOUNT_PUBLIC_KEY
      );
      const secondsPlayed = gameDataAccount.secondsPlayed;
      const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
          Buffer.from("game_state"),
          Buffer.from("" + secondsPlayed),
        ],
        program.programId
      );

      await program.methods
        .vote({
          ...(joypadButton === JoypadButton.Up
            ? { up: {} }
            : joypadButton === JoypadButton.Down
            ? { down: {} }
            : joypadButton === JoypadButton.Left
            ? { left: {} }
            : joypadButton === JoypadButton.Right
            ? { right: {} }
            : joypadButton === JoypadButton.A
            ? { a: {} }
            : joypadButton === JoypadButton.B
            ? { b: {} }
            : joypadButton === JoypadButton.Start
            ? { start: {} }
            : joypadButton === JoypadButton.Select
            ? { select: {} }
            : { nothing: {} }),
        })
        .accounts({
          gameState: gameStatePda,
          gameData: GAME_DATA_ACCOUNT_PUBLIC_KEY,
          player: anchor.getProvider().publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        })
        .rpc();
    }
  };

  return (
    <div css={styles.root}>
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
