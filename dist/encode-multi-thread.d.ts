import type { InitInput } from '../pkg/gifski_wasm.js';
import { EncodeOptions } from './encode';
declare function initMT(moduleOrPath?: InitInput, maybeMemory?: WebAssembly.Memory): Promise<{
    encode: typeof import("../pkg-parallel/gifski_wasm.js").encode;
    counterAddress: number;
    memory: WebAssembly.Memory;
}>;
declare function initST(moduleOrPath?: InitInput): Promise<{
    encode: typeof import("../pkg/gifski_wasm.js").encode;
}>;
export declare function init(moduleOrPath?: InitInput, maybeMemory?: WebAssembly.Memory): Promise<ReturnType<typeof initMT | typeof initST>>;
export declare function encode(options: EncodeOptions, memory?: WebAssembly.Memory): Promise<{
    start: () => Promise<Uint8Array<ArrayBufferLike>>;
    counterAddress: any;
    returnedMemory: any;
}>;
export default encode;
//# sourceMappingURL=encode-multi-thread.d.ts.map