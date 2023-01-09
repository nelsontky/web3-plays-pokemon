import axios from "axios";
import pako from "pako";
import { useEffect, useState } from "react";
import { useAppSelector } from "./redux";

export default function useGameboyMemory() {
  const gameStatesStatus = useAppSelector((state) => state.gameStates.status);
  const currentSaveStateCid = useAppSelector(
    (state) => state.gameStates.currentSaveStateCid
  );
  const [gameboyMemory, setGameboyMemory] = useState<Uint8Array>();

  useEffect(
    function fetchGameboyMemory() {
      if (
        gameStatesStatus === "succeeded" &&
        currentSaveStateCid !== undefined &&
        currentSaveStateCid.length > 0
      ) {
        let hasUnmounted = false;

        (async () => {
          const response = await axios.get(
            `https://${currentSaveStateCid}.ipfs.cf-ipfs.com`,
            {
              responseType: "arraybuffer",
            }
          );

          if (hasUnmounted) {
            return;
          }

          const inflated = pako.inflate(response.data, { to: "string" });
          setGameboyMemory(JSON.parse(inflated).gameboyMemory);
        })();

        return () => {
          hasUnmounted = true;
        };
      }
    },
    [currentSaveStateCid, gameStatesStatus]
  );

  return gameboyMemory;
}
