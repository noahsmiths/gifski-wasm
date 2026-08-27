import { threads } from 'wasm-feature-detect';
import { _internal_encode } from './encode';
async function initMT(moduleOrPath, maybeMemory) {
    const { default: init, initThreadPool, encode, get_counter_mem_address } = await import('../pkg-parallel/gifski_wasm.js');
    const { memory } = await init(moduleOrPath, maybeMemory);
    await initThreadPool(globalThis.navigator.hardwareConcurrency);
    const counterAddress = get_counter_mem_address();
    return { encode, counterAddress, memory };
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
    const { encode: wasmEncode, counterAddress, memory: returnedMemory } = await init(undefined, memory);
    return {
        start: () => (_internal_encode(wasmEncode, options)),
        counterAddress,
        returnedMemory,
    };
}
export default encode;
