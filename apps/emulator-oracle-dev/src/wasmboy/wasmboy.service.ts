import * as fs from "fs/promises";
import * as path from "path";
import {
  GAMEBOY_CAMERA_HEIGHT,
  GAMEBOY_CAMERA_WIDTH,
} from "./display.constant";
import { decodeSaveState } from "./encode-decde-save-state.util";
import wasmImportObject from "./import-object.util";

export class WasmboyService {
  private instance: any;
  private wasmByteMemory: Uint8Array;

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

  constructor(instance: WebAssembly.Instance, wasmByteMemory: Uint8Array) {
    this.wasmByteMemory = wasmByteMemory;

    this.instance = instance;
    this.instance.exports.config(
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

  static async new() {
    const wasmBinary = await fs.readFile(
      path.join(__dirname, "..", "assets", "core.untouched.wasm"),
    );
    const instantiatedWasm = await WebAssembly.instantiate(
      wasmBinary,
      wasmImportObject,
    );
    const instance = instantiatedWasm.instance;
    const wasmByteMemory = new Uint8Array(
      (instance.exports.memory as any).buffer,
    );

    const pokemonRedBuffer = await fs.readFile(
      path.join(
        __dirname,
        "..",
        "assets",
        "Pokemon - Red Version (USA, Europe) (SGB Enhanced).gb",
      ),
    );
    // Load the game data
    for (let i = 0; i < pokemonRedBuffer.length; i++) {
      if (pokemonRedBuffer[i]) {
        wasmByteMemory[(instance.exports as any).CARTRIDGE_ROM_LOCATION + i] =
          pokemonRedBuffer[i];
      }
    }

    return new WasmboyService(instance, wasmByteMemory);
  }

  executeFrames(frames: number) {
    for (let i = 0; i < frames; i++) {
      this.instance.exports.executeFrame();
    }
  }

  async saveState() {
    this.instance.exports.saveState();

    const gameboyMemory = this.wasmByteMemory.slice(
      this.instance.exports.GAMEBOY_INTERNAL_MEMORY_LOCATION,
      this.instance.exports.GAMEBOY_INTERNAL_MEMORY_LOCATION +
        this.instance.exports.GAMEBOY_INTERNAL_MEMORY_SIZE,
    );
    const paletteMemory = this.wasmByteMemory.slice(
      this.instance.exports.GBC_PALETTE_LOCATION,
      this.instance.exports.GBC_PALETTE_LOCATION +
        this.instance.exports.GBC_PALETTE_SIZE,
    );
    const wasmboyState = this.wasmByteMemory.slice(
      this.instance.exports.WASMBOY_STATE_LOCATION,
      this.instance.exports.WASMBOY_STATE_LOCATION +
        this.instance.exports.WASMBOY_STATE_SIZE,
    );

    const decodedSaveState = decodeSaveState({
      gameboyMemory,
      paletteMemory,
      wasmboyState,
    });

    await fs.writeFile(
      path.join(__dirname, "save-state.json"),
      JSON.stringify(decodedSaveState),
    );

    const imageDataArray = this.getImageDataFromGraphicsFrameBuffer();

    return imageDataArray;
  }

  private getImageDataFromGraphicsFrameBuffer() {
    const frameInProgressVideoOutputLocation =
      this.instance.exports.FRAME_LOCATION;

    const frameInProgressMemory = this.wasmByteMemory.slice(
      frameInProgressVideoOutputLocation,
      frameInProgressVideoOutputLocation +
        GAMEBOY_CAMERA_HEIGHT * GAMEBOY_CAMERA_WIDTH * 3 +
        1,
    );

    const imageDataArray = new Uint8ClampedArray(
      GAMEBOY_CAMERA_HEIGHT * GAMEBOY_CAMERA_WIDTH * 4,
    );
    const rgbColor = [];

    for (let y = 0; y < GAMEBOY_CAMERA_HEIGHT; y++) {
      for (let x = 0; x < GAMEBOY_CAMERA_WIDTH; x++) {
        // Each color has an R G B component
        const pixelStart = (y * GAMEBOY_CAMERA_WIDTH + x) * 3;

        for (let color = 0; color < 3; color++) {
          rgbColor[color] = frameInProgressMemory[pixelStart + color];
        }

        // Doing graphics using second answer on:
        // https://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
        // Image Data mapping
        const imageDataIndex = (x + y * GAMEBOY_CAMERA_WIDTH) * 4;

        imageDataArray[imageDataIndex] = rgbColor[0];
        imageDataArray[imageDataIndex + 1] = rgbColor[1];
        imageDataArray[imageDataIndex + 2] = rgbColor[2];
        // Alpha, no transparency
        imageDataArray[imageDataIndex + 3] = 255;
      }
    }

    const result = [];
    for (let i = 0; i < imageDataArray.length - 4; i = i + 4) {
      result.push(
        `rgba(${imageDataArray[i]}, ${imageDataArray[i + 1]},${
          imageDataArray[i + 2]
        }, ${imageDataArray[i + 3]})`,
      );
    }

    return result;
  }
}
