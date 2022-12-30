import { Injectable } from "@nestjs/common";
import {
  FPS,
  GAMEBOY_CAMERA_HEIGHT,
  GAMEBOY_CAMERA_WIDTH,
  JoypadButton,
} from "common";
import * as fs from "fs/promises";
import * as path from "path";
import {
  decodeSaveState,
  encodeSaveState,
} from "./encode-decde-save-state.util";
import wasmImportObject from "./import-object.util";
import * as pako from "pako";
import { NFTStorage, Blob } from "nft.storage";

const FRAMES_TO_HOLD_BUTTON = 5;

@Injectable()
export class WasmboyService {
  // wasmboy config
  private enableBootRom = false;
  private preferGbc = false;
  private audioBatchProcessing = false;
  private graphicsBatchProcessing = false;
  private timersBatchProcessing = false;
  private graphicsDisableScanlineRendering = false;
  private audioAccumulateSamples = false;
  private tileRendering = false;
  private tileCaching = false;

  async run(frames: number, joypadButton: JoypadButton) {
    const [wasmBoy, wasmByteMemory] = await this.getWasmBoyCore();
    await this.loadRom(wasmBoy, wasmByteMemory);
    try {
      await this.loadState(wasmBoy, wasmByteMemory);
    } catch {}

    const framesImageData = this.executeFrames(
      wasmBoy,
      wasmByteMemory,
      frames,
      joypadButton,
    );

    const saveState = await this.saveState(wasmBoy, wasmByteMemory);

    const compressedFramesImageData = pako.deflate(
      JSON.stringify(framesImageData),
    );
    const compressedSaveState = pako.deflate(JSON.stringify(saveState));

    // const NFT_STORAGE_TOKEN = "token";
    // const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

    // const framesImageDataCid = await client.storeBlob(
    //   new Blob([compressedFramesImageData]),
    // );
    // const saveStateCid = await client.storeBlob(
    //   new Blob([compressedSaveState]),
    // );

    // console.log({
    //   framesImageDataCid,
    //   saveStateCid,
    // });
    return compressedFramesImageData;
  }

  private executeFrames(
    wasmBoy: any,
    wasmByteMemory: Uint8Array,
    frames: number,
    joypadButton: JoypadButton,
  ) {
    this.setJoypadState(wasmBoy, joypadButton);

    const framesToExecutePerStep = frames / FPS;
    const framesImageData: number[][] = [];
    for (let i = 0; i < frames / framesToExecutePerStep; i++) {
      wasmBoy.executeMultipleFrames(framesToExecutePerStep);
      framesImageData.push(
        this.getImageDataFromGraphicsFrameBuffer(wasmBoy, wasmByteMemory),
      );

      const isReleaseJoyPad =
        i * framesToExecutePerStep >= FRAMES_TO_HOLD_BUTTON;
      if (isReleaseJoyPad) {
        this.setJoypadState(wasmBoy, null);
      }
    }

    // prevent last frame from being a white or black screen
    while (
      framesImageData[framesImageData.length - 1].every(
        (value) => value === 255,
      ) ||
      framesImageData[framesImageData.length - 1].every((value) => value === 0)
    ) {
      wasmBoy.executeMultipleFrames(5);
      framesImageData.push(
        this.getImageDataFromGraphicsFrameBuffer(wasmBoy, wasmByteMemory),
      );
    }

    return framesImageData;
  }

  private async getWasmBoyCore() {
    const wasmBinary = await fs.readFile(
      path.join(__dirname, "..", "assets", "core.untouched.wasm"),
    );
    const instantiatedWasm = await WebAssembly.instantiate(
      wasmBinary,
      wasmImportObject,
    );
    const wasmBoy = instantiatedWasm.instance.exports as any;
    const wasmByteMemory = new Uint8Array((wasmBoy.memory as any).buffer);

    return [wasmBoy, wasmByteMemory];
  }

  private async loadRom(wasmBoy: any, wasmByteMemory: Uint8Array) {
    const pokemonRedBuffer = await fs.readFile(
      path.join(
        __dirname,
        "..",
        "assets",
        "Pokemon - Red Version (USA, Europe) (SGB Enhanced).gb",
      ),
    );
    wasmByteMemory.set(pokemonRedBuffer, wasmBoy.CARTRIDGE_ROM_LOCATION);

    wasmBoy.config(
      this.enableBootRom ? 1 : 0,
      this.preferGbc ? 1 : 0,
      this.audioBatchProcessing ? 1 : 0,
      this.graphicsBatchProcessing ? 1 : 0,
      this.timersBatchProcessing ? 1 : 0,
      this.graphicsDisableScanlineRendering ? 1 : 0,
      this.audioAccumulateSamples ? 1 : 0,
      this.tileRendering ? 1 : 0,
      this.tileCaching ? 1 : 0,
    );
  }

  private async loadState(wasmBoy: any, wasmByteMemory: Uint8Array) {
    const decodedSaveState = await fs.readFile(
      path.join(".", "save-state.json"),
    );
    const encodedSaveState = encodeSaveState(
      JSON.parse(decodedSaveState.toString()),
    );

    wasmByteMemory.set(
      encodedSaveState.gameboyMemory,
      wasmBoy.GAMEBOY_INTERNAL_MEMORY_LOCATION,
    );
    wasmByteMemory.set(
      encodedSaveState.paletteMemory,
      wasmBoy.GBC_PALETTE_LOCATION,
    );
    wasmByteMemory.set(
      encodedSaveState.wasmboyState,
      wasmBoy.WASMBOY_STATE_LOCATION,
    );
    wasmBoy.loadState();
  }

  private async saveState(wasmBoy: any, wasmByteMemory: Uint8Array) {
    wasmBoy.saveState();

    const gameboyMemory = wasmByteMemory.slice(
      wasmBoy.GAMEBOY_INTERNAL_MEMORY_LOCATION,
      wasmBoy.GAMEBOY_INTERNAL_MEMORY_LOCATION +
        wasmBoy.GAMEBOY_INTERNAL_MEMORY_SIZE,
    );
    const paletteMemory = wasmByteMemory.slice(
      wasmBoy.GBC_PALETTE_LOCATION,
      wasmBoy.GBC_PALETTE_LOCATION + wasmBoy.GBC_PALETTE_SIZE,
    );
    const wasmboyState = wasmByteMemory.slice(
      wasmBoy.WASMBOY_STATE_LOCATION,
      wasmBoy.WASMBOY_STATE_LOCATION + wasmBoy.WASMBOY_STATE_SIZE,
    );

    const decodedSaveState = decodeSaveState({
      gameboyMemory,
      paletteMemory,
      wasmboyState,
    });

    await fs.writeFile(
      path.join(".", "save-state.json"),
      JSON.stringify(decodedSaveState),
    );

    return {
      gameboyMemory,
      paletteMemory,
      wasmboyState,
    };
  }

  private getImageDataFromGraphicsFrameBuffer(
    wasmBoy: any,
    wasmByteMemory: Uint8Array,
  ) {
    const frameInProgressVideoOutputLocation = wasmBoy.FRAME_LOCATION;

    const frameInProgressMemory = wasmByteMemory.slice(
      frameInProgressVideoOutputLocation,
      frameInProgressVideoOutputLocation +
        GAMEBOY_CAMERA_HEIGHT * GAMEBOY_CAMERA_WIDTH * 3 +
        1,
    );

    const imageDataArray: number[] = [];
    for (let y = 0; y < GAMEBOY_CAMERA_HEIGHT; y++) {
      for (let x = 0; x < GAMEBOY_CAMERA_WIDTH; x++) {
        // Each color has an R G B component
        const pixelStart = (y * GAMEBOY_CAMERA_WIDTH + x) * 3;

        for (let color = 0; color < 3; color++) {
          imageDataArray.push(frameInProgressMemory[pixelStart + color]);
        }
      }
    }

    return imageDataArray;
  }

  private setJoypadState(wasmboy: any, joypadButton: JoypadButton | null) {
    wasmboy.setJoypadState(
      JoypadButton.Up === joypadButton ? 1 : 0,
      JoypadButton.Right === joypadButton ? 1 : 0,
      JoypadButton.Down === joypadButton ? 1 : 0,
      JoypadButton.Left === joypadButton ? 1 : 0,
      JoypadButton.A === joypadButton ? 1 : 0,
      JoypadButton.B === joypadButton ? 1 : 0,
      JoypadButton.Select === joypadButton ? 1 : 0,
      JoypadButton.Start === joypadButton ? 1 : 0,
    );
  }
}
