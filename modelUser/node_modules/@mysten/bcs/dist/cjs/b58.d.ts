export declare const toBase58: (buffer: Uint8Array) => string;
export declare const fromBase58: (str: string) => Uint8Array<ArrayBufferLike>;
/** @deprecated use toBase58 instead */
export declare const toB58: (buffer: Uint8Array) => string;
/** @deprecated use fromBase58 instead */
export declare const fromB58: (str: string) => Uint8Array<ArrayBufferLike>;
