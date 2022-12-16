import { WasmboyService } from "./wasmboy.service";

export const WASMBOY_SERVICE = "WASMBOY_SERVICE";

export const wasmboyProvider = {
  provide: WASMBOY_SERVICE,
  useFactory: async () => WasmboyService.new(),
};
