export declare function fromBase64(base64String: string): Uint8Array;
export declare function toBase64(bytes: Uint8Array): string;
/** @deprecated use toBase64 instead */
export declare const toB64: typeof toBase64;
/** @deprecated use fromBase64 instead */
export declare const fromB64: typeof fromBase64;
