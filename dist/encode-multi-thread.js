import { threads } from 'wasm-feature-detect';
import { _internal_encode } from './encode';
async function initMT(moduleOrPath, maybeMemory) {
    const { default: init, initThreadPool, encode, } = await import('../pkg-parallel/gifski_wasm.js');
    await init(moduleOrPath, maybeMemory);
    await initThreadPool(globalThis.navigator.hardwareConcurrency);
    return { encode };
}
async function initST(moduleOrPath) {
    const { default: init, encode } = await import('../pkg/gifski_wasm.js');
    await init(moduleOrPath);
    return { encode };
}
let wasmReady;
export async function init(moduleOrPath, maybeMemory) {
    if (!wasmReady) {
        const hasHardwareConcurrency = globalThis.navigator?.hardwareConcurrency > 1;
        const isWorker = typeof self !== 'undefined' &&
            typeof WorkerGlobalScope !== 'undefined' &&
            self instanceof WorkerGlobalScope;
        if (isWorker && hasHardwareConcurrency && (await threads())) {
            wasmReady = initMT(moduleOrPath, maybeMemory);
        }
        else {
            wasmReady = initST(moduleOrPath);
        }
    }
    return wasmReady;
}
export async function encode(options, memory) {
    const { encode: wasmEncode } = await init(undefined, memory);
    return _internal_encode(wasmEncode, options);
}
export async function getWrittenBytes(memory) {
    const { default: init, get_written_bytes } = await import('../pkg-parallel/gifski_wasm.js');
    await init(undefined, memory);
    return get_written_bytes();
}
export default encode;
