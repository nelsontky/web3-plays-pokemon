import { FPS, GAMEBOY_CAMERA_HEIGHT, GAMEBOY_CAMERA_WIDTH } from "common";
import { useEffect, useRef, useState } from "react";
import tw from "twin.macro";
import { GAME_DATA_ACCOUNT_PUBLIC_KEY } from "../constants";
import { useReadonlyProgram } from "../hooks/useProgram";
import renderFrame, { CELL_SIZE } from "../utils/renderFrame";
import * as anchor from "@project-serum/anchor";
import axios from "axios";
import pako from "pako";
import { EventEmitter } from "@solana/wallet-adapter-base";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>();
  const program = useReadonlyProgram();
  const [framesImageDataCid, setFramesImageDataCid] = useState<string>();

  useEffect(
    function setupGameDataListener() {
      if (program) {
        let hasMounted = false;
        const emitter = program.account.gameData.subscribe(
          GAME_DATA_ACCOUNT_PUBLIC_KEY
        );
        emitter.addListener("change", (event) => {
          console.log("gameData updated:", event);
        });

        return () => {
          emitter.removeAllListeners();
        };
      }
    },
    [program]
  );

  useEffect(
    function setupListeners() {
      if (program) {
        let hasUnmounted = false;
        let emitter: EventEmitter<string | symbol, any>;
        (async () => {
          const gameDataAccount = await program.account.gameData.fetch(
            GAME_DATA_ACCOUNT_PUBLIC_KEY
          );
          const secondsPlayed = gameDataAccount.secondsPlayed;

          const [currentGameStatePda] =
            anchor.web3.PublicKey.findProgramAddressSync(
              [
                GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
                Buffer.from("game_state"),
                Buffer.from("" + secondsPlayed),
              ],
              program.programId
            );
          const [prevGameStatePda] =
            anchor.web3.PublicKey.findProgramAddressSync(
              [
                GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
                Buffer.from("game_state"),
                Buffer.from("" + (secondsPlayed - 1)),
              ],
              program.programId
            );

          if (hasUnmounted) {
            return;
          }

          emitter = program.account.gameState.subscribe(
            currentGameStatePda,
            "processed"
          );
          const onChange = async (account: any) => {
            console.log("account updated:", account);
            if (account.framesImageCid.length > 0) {
              emitter.removeAllListeners();
              setFramesImageDataCid(account.framesImageCid);

              const gameDataAccount = await program.account.gameData.fetch(
                GAME_DATA_ACCOUNT_PUBLIC_KEY
              );
              const secondsPlayed = gameDataAccount.secondsPlayed;
              const [currentGameStatePda] =
                anchor.web3.PublicKey.findProgramAddressSync(
                  [
                    GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
                    Buffer.from("game_state"),
                    Buffer.from("" + secondsPlayed),
                  ],
                  program.programId
                );

              emitter = program.account.gameState.subscribe(
                currentGameStatePda,
                "processed"
              );

              emitter.addListener("change", onChange);
            }
          };
          emitter.addListener("change", onChange);

          const framesImageDataCid = (
            await program.account.gameState.fetch(prevGameStatePda)
          ).framesImageCid;
          setFramesImageDataCid(framesImageDataCid);
        })();

        return () => {
          hasUnmounted = true;
          if (emitter) {
            emitter.removeAllListeners();
          }
        };
      }
    },
    [program]
  );

  useEffect(
    function renderFrames() {
      if (framesImageDataCid) {
        let hasUnmounted = false;

        (async () => {
          const response = await axios.get(
            `https://${framesImageDataCid}.ipfs.cf-ipfs.com`,
            {
              responseType: "arraybuffer",
            }
          );

          if (hasUnmounted) {
            return;
          }

          const inflated = pako.inflate(response.data, { to: "string" });
          const framesImageData: number[][] = JSON.parse(inflated);

          const renderLoop = () => {
            if (canvasRef.current) {
              const frameDataArray = framesImageData.shift();
              const ctx = canvasRef.current.getContext("2d");

              if (ctx && frameDataArray) {
                requestAnimationFrame(renderLoop);

                setTimeout(() => {
                  renderFrame(frameDataArray, ctx);
                }, 1000 / FPS);
              }
            }
          };

          renderLoop();
        })();

        return () => {
          hasUnmounted = true;
        };
      }
    },
    [framesImageDataCid]
  );

  return (
    <canvas
      css={tw`mx-auto`}
      ref={(node) => {
        if (node && !canvasRef.current) {
          node.height = CELL_SIZE * GAMEBOY_CAMERA_HEIGHT;
          node.width = CELL_SIZE * GAMEBOY_CAMERA_WIDTH;
          canvasRef.current = node;
        }
      }}
    />
  );
}
