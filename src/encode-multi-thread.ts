import type { InitInput } from '../pkg/gifski_wasm.js';
import { threads } from 'wasm-feature-detect';
import { _internal_encode, EncodeOptions } from './encode';

async function initMT(moduleOrPath?: InitInput, maybeMemory?: WebAssembly.Memory) {
  const {
    default: init,
    initThreadPool,
    encode,
    get_counter_mem_address
  } = await import('../pkg-parallel/gifski_wasm.js');
  const { memory } = await init(moduleOrPath, maybeMemory);
  await initThreadPool(globalThis.navigator.hardwareConcurrency);
  const counterAddress = get_counter_mem_address();
  return { encode, counterAddress, memory };
}

async function initST(moduleOrPath?: InitInput) {
  const { default: init, encode } = await import('../pkg/gifski_wasm.js');
  await init(moduleOrPath);
  return { encode };
}

let wasmReady: ReturnType<typeof initMT | typeof initST>;

export async function init(
  moduleOrPath?: InitInput,
  maybeMemory?: WebAssembly.Memory
): Promise<ReturnType<typeof initMT | typeof initST>> {
  if (!wasmReady) {
    const hasHardwareConcurrency =
      globalThis.navigator?.hardwareConcurrency > 1;
    const isWorker =
      typeof self !== 'undefined' &&
      typeof WorkerGlobalScope !== 'undefined' &&
      self instanceof WorkerGlobalScope;

    if (isWorker && hasHardwareConcurrency && (await threads())) {
      wasmReady = initMT(moduleOrPath, maybeMemory);
    } else {
      wasmReady = initST(moduleOrPath);
    }
  }

  return wasmReady;
}

export async function encode(options: EncodeOptions, memory?: WebAssembly.Memory) {
  const { encode: wasmEncode, counterAddress, memory: returnedMemory } = await init(undefined, memory) as any;
  return { 
    start: () => {
      _internal_encode(wasmEncode, options)
    },
    counterAddress,
    returnedMemory,
  };
}

export default encode;
