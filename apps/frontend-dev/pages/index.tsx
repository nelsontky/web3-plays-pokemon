import { useState } from "react";
// @ts-ignore
import { WasmBoy } from "wasmboy";
import saveState from "./save-state.json";

// import { Button } from "ui";

const WasmBoyOptions = {
  headless: false,
  useGbcWhenOptional: true,
  isAudioEnabled: true,
  frameSkip: 1,
  audioBatchProcessing: true,
  timersBatchProcessing: false,
  audioAccumulateSamples: true,
  graphicsBatchProcessing: false,
  graphicsDisableScanlineRendering: false,
  tileRendering: true,
  tileCaching: true,
  gameboyFPSCap: 60,
  updateGraphicsCallback: false,
  updateAudioCallback: false,
  saveStateCallback: false,
};

interface SaveStateEncoded {
  gameboyMemory: Uint8Array;
  paletteMemory: Uint8Array;
  wasmboyState: Uint8Array;
  cartridgeRam: Uint8Array;
}

interface SaveStateDecoded {
  gameboyMemory: string;
  paletteMemory: string;
  wasmboyState: string;
}

const encodeSaveState = (saveState: SaveStateDecoded) => ({
  date: 1671208448872,
  isAuto: false,
  wasmboyMemory: {
    gameBoyMemory: new Uint8Array(
      Buffer.from(saveState.gameboyMemory, "base64")
    ),
    wasmBoyPaletteMemory: new Uint8Array(
      Buffer.from(saveState.paletteMemory, "base64")
    ),
    wasmBoyInternalState: new Uint8Array(
      Buffer.from(saveState.wasmboyState, "base64")
    ),
    cartridgeRam: new Uint8Array(Array.from({ length: 32768 }, () => 0)),
  },
});

export default function Web() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div>
      <h1>Web</h1>
      <canvas
        ref={(canvasElement) => {
          WasmBoy.config(WasmBoyOptions, canvasElement)
            .then(() => {
              console.log("WasmBoy is configured!");
              return WasmBoy.loadROM("/rom.gb");
            })
            .then(() => {
              console.log("WasmBoy ROM loaded!");
              return WasmBoy.play();
            })
            .then(() => {
              setLoaded(true);
              console.log("WasmBoy is playing!");
            })
            .catch(() => {
              console.error("Error Configuring WasmBoy...");
            });
        }}
      />
      {loaded && (
        <button
          onClick={() => {
            WasmBoy.saveState()
              .then(() => {
                console.log("WasmBoy saved the state!");
                return WasmBoy.play();
              })
              .then(() => {
                return WasmBoy.getSaveStates();
              })
              .then((array: any) => {
                console.log(array);
                return WasmBoy.loadState(array[1]);
              })
              .then(() => {
                console.log("state loaded");
                return WasmBoy.play();
              })
              .catch(() => {
                console.error("WasmBoy had an error saving the state...");
              });
          }}
        >
          Save state
        </button>
      )}
      {loaded && (
        <button
          onClick={() => {
            const encodedSaveState = encodeSaveState(saveState);
            WasmBoy.loadState(encodedSaveState)
              .then(() => {
                console.log("WasmBoy loaded the state!");
                // Call .play() here to continue playing the ROM.
                return WasmBoy.play();
              })
              .then(
                () =>
                  new Promise((resolve) =>
                    setTimeout(resolve, (1 / 60) * 16 * 1000)
                  )
              )
              .then(() => {
                return WasmBoy.pause();
              })
              .catch((e: any) => {
                console.log(e);
                console.error("WasmBoy had an error loading the state...");
              });
          }}
        >
          Load state
        </button>
      )}
    </div>
  );
}
