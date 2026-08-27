import { threads } from 'wasm-feature-detect';
import { _internal_encode } from './encode';
import { get_written_bytes } from '../pkg-parallel/gifski_wasm.js';
async function initMT(moduleOrPath) {
    const { default: init, initThreadPool, encode, } = await import('../pkg-parallel/gifski_wasm.js');
    await init(moduleOrPath);
    await initThreadPool(globalThis.navigator.hardwareConcurrency);
    return { encode };
}
async function initST(moduleOrPath) {
    const { default: init, encode } = await import('../pkg/gifski_wasm.js');
    await init(moduleOrPath);
    return { encode };
}
let wasmReady;
export async function init(moduleOrPath) {
    if (!wasmReady) {
        const hasHardwareConcurrency = globalThis.navigator?.hardwareConcurrency > 1;
        const isWorker = typeof self !== 'undefined' &&
            typeof WorkerGlobalScope !== 'undefined' &&
            self instanceof WorkerGlobalScope;
        if (isWorker && hasHardwareConcurrency && (await threads())) {
            wasmReady = initMT(moduleOrPath);
        }
        else {
            wasmReady = initST(moduleOrPath);
        }
    }
    return wasmReady;
}
export async function encode(options) {
    const { encode: wasmEncode } = await init();
    return _internal_encode(wasmEncode, options);
}
export function getWrittenBytes() {
    return get_written_bytes();
}
export default encode;
