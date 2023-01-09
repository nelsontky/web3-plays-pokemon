import { Injectable } from "@nestjs/common";
import {
  FRAMES_TO_DRAW_PER_EXECUTION,
  GAMEBOY_CAMERA_HEIGHT,
  GAMEBOY_CAMERA_WIDTH,
  GAMEBOY_FPS,
  GAMEBOY_MEMORY_OFFSET,
  JoypadButton,
  NUMBER_OF_SECONDS_TO_EXECUTE_PER_BUTTON_PRESS,
} from "common";
import * as fs from "fs/promises";
import * as path from "path";
import wasmImportObject from "./import-object.util";
import * as pako from "pako";
import { IpfsService } from "src/ipfs/ipfs.service";

const FRAMES_TO_HOLD_BUTTON = 15;

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

  constructor(private readonly ipfsService: IpfsService) {}

  async run(joypadButton: JoypadButton, prevSaveStateCid: string) {
    const [wasmBoy, wasmByteMemory] = await this.getWasmBoyCore();
    await this.loadRom(wasmBoy, wasmByteMemory);
    await this.loadState(wasmBoy, wasmByteMemory, prevSaveStateCid);

    const framesImageData = this.executeFrames(
      wasmBoy,
      wasmByteMemory,
      GAMEBOY_FPS * NUMBER_OF_SECONDS_TO_EXECUTE_PER_BUTTON_PRESS,
      joypadButton,
    );
    const saveState = await this.saveState(wasmBoy, wasmByteMemory);

    const compressedFramesImageData = pako.deflate(
      JSON.stringify(framesImageData),
    );
    const compressedSaveState = pako.deflate(JSON.stringify(saveState));

    const [framesImageDataCid, saveStateCid] = await Promise.all([
      this.ipfsService.upload(compressedFramesImageData),
      this.ipfsService.upload(compressedSaveState),
    ]);

    if (framesImageDataCid.toString().length <= 0) {
      throw new Error("framesImageDataCid length is 0");
    }
    if (saveStateCid.toString().length <= 0) {
      throw new Error("saveStateCid length is 0");
    }

    return {
      framesImageDataCid: framesImageDataCid.toString(),
      saveStateCid: saveStateCid.toString(),
    };
  }

  private executeFrames(
    wasmBoy: any,
    wasmByteMemory: Uint8Array,
    frames: number,
    joypadButton: JoypadButton,
  ) {
    this.setJoypadState(wasmBoy, joypadButton);

    const framesToHoldButton =
      joypadButton === JoypadButton.TurboUp ||
      joypadButton === JoypadButton.TurboDown ||
      joypadButton === JoypadButton.TurboLeft ||
      joypadButton === JoypadButton.TurboRight
        ? frames
        : FRAMES_TO_HOLD_BUTTON;

    const framesToExecutePerStep = frames / FRAMES_TO_DRAW_PER_EXECUTION;
    const framesImageData: number[][] = [];
    for (let i = 0; i < FRAMES_TO_DRAW_PER_EXECUTION; i++) {
      wasmBoy.executeMultipleFrames(framesToExecutePerStep);
      framesImageData.push(
        this.getImageDataFromGraphicsFrameBuffer(wasmBoy, wasmByteMemory),
      );

      const shouldReleaseJoyPad =
        (i + 1) * framesToExecutePerStep >= framesToHoldButton;
      if (shouldReleaseJoyPad) {
        this.setJoypadState(wasmBoy, null);
      }
    }

    this.setJoypadState(wasmBoy, null);

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
      path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "assets",
        "core.untouched.wasm",
      ),
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
        "..",
        "..",
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

  private async loadState(
    wasmBoy: any,
    wasmByteMemory: Uint8Array,
    prevSaveStateCid: string,
  ) {
    const data = await this.ipfsService.download(prevSaveStateCid);
    const inflated = pako.inflate(data, { to: "string" });
    const saveState = JSON.parse(inflated);

    wasmByteMemory.set(
      new Uint8Array(saveState.gameboyMemory),
      wasmBoy.GAMEBOY_INTERNAL_MEMORY_LOCATION,
    );
    wasmByteMemory.set(
      new Uint8Array(saveState.paletteMemory),
      wasmBoy.GBC_PALETTE_LOCATION,
    );
    wasmByteMemory.set(
      new Uint8Array(saveState.wasmboyState),
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

    const LETTER_PRINTING_DELAY_FLAGS_LOCATION = 0xd358;
    // set no text delay
    gameboyMemory[
      LETTER_PRINTING_DELAY_FLAGS_LOCATION - GAMEBOY_MEMORY_OFFSET
    ] = 0;

    const paletteMemory = wasmByteMemory.slice(
      wasmBoy.GBC_PALETTE_LOCATION,
      wasmBoy.GBC_PALETTE_LOCATION + wasmBoy.GBC_PALETTE_SIZE,
    );
    const wasmboyState = wasmByteMemory.slice(
      wasmBoy.WASMBOY_STATE_LOCATION,
      wasmBoy.WASMBOY_STATE_LOCATION + wasmBoy.WASMBOY_STATE_SIZE,
    );

    return {
      gameboyMemory: Array.from(gameboyMemory),
      paletteMemory: Array.from(paletteMemory),
      wasmboyState: Array.from(wasmboyState),
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
      JoypadButton.Up === joypadButton || JoypadButton.TurboUp === joypadButton
        ? 1
        : 0,
      JoypadButton.Right === joypadButton ||
        JoypadButton.TurboRight === joypadButton
        ? 1
        : 0,
      JoypadButton.Down === joypadButton ||
        JoypadButton.TurboDown === joypadButton
        ? 1
        : 0,
      JoypadButton.Left === joypadButton ||
        JoypadButton.TurboLeft === joypadButton
        ? 1
        : 0,
      JoypadButton.A === joypadButton ? 1 : 0,
      JoypadButton.B === joypadButton ? 1 : 0,
      JoypadButton.Select === joypadButton ? 1 : 0,
      JoypadButton.Start === joypadButton ? 1 : 0,
    );
  }
}
