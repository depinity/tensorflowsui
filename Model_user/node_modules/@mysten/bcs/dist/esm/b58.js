import bs58 from "bs58";
const toBase58 = (buffer) => bs58.encode(buffer);
const fromBase58 = (str) => bs58.decode(str);
const toB58 = toBase58;
const fromB58 = fromBase58;
export {
  fromB58,
  fromBase58,
  toB58,
  toBase58
};
//# sourceMappingURL=b58.js.map
