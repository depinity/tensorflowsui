"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var publickey_exports = {};
__export(publickey_exports, {
  ZkLoginPublicIdentifier: () => ZkLoginPublicIdentifier,
  parseSerializedZkLoginSignature: () => parseSerializedZkLoginSignature,
  toZkLoginPublicIdentifier: () => toZkLoginPublicIdentifier
});
module.exports = __toCommonJS(publickey_exports);
var import_bcs = require("@mysten/bcs");
var import_blake2b = require("@noble/hashes/blake2b");
var import_utils = require("@noble/hashes/utils");
var import_publickey = require("../cryptography/publickey.js");
var import_signature_scheme = require("../cryptography/signature-scheme.js");
var import_client = require("../graphql/client.js");
var import_latest = require("../graphql/schemas/latest/index.js");
var import_sui_types = require("../utils/sui-types.js");
var import_jwt_utils = require("./jwt-utils.js");
var import_signature = require("./signature.js");
var import_utils2 = require("./utils.js");
var _data, _client, _legacyAddress, _ZkLoginPublicIdentifier_instances, toLegacyAddress_fn;
const _ZkLoginPublicIdentifier = class _ZkLoginPublicIdentifier extends import_publickey.PublicKey {
  /**
   * Create a new ZkLoginPublicIdentifier object
   * @param value zkLogin public identifier as buffer or base-64 encoded string
   */
  constructor(value, { client } = {}) {
    super();
    __privateAdd(this, _ZkLoginPublicIdentifier_instances);
    __privateAdd(this, _data);
    __privateAdd(this, _client);
    __privateAdd(this, _legacyAddress);
    __privateSet(this, _client, client);
    if (typeof value === "string") {
      __privateSet(this, _data, (0, import_bcs.fromBase64)(value));
    } else if (value instanceof Uint8Array) {
      __privateSet(this, _data, value);
    } else {
      __privateSet(this, _data, Uint8Array.from(value));
    }
    __privateSet(this, _legacyAddress, __privateGet(this, _data).length !== __privateGet(this, _data)[0] + 1 + 32);
    if (__privateGet(this, _legacyAddress)) {
      __privateSet(this, _data, normalizeZkLoginPublicKeyBytes(__privateGet(this, _data)));
    }
  }
  /**
   * Checks if two zkLogin public identifiers are equal
   */
  equals(publicKey) {
    return super.equals(publicKey);
  }
  toSuiAddress() {
    if (__privateGet(this, _legacyAddress)) {
      return __privateMethod(this, _ZkLoginPublicIdentifier_instances, toLegacyAddress_fn).call(this);
    }
    return super.toSuiAddress();
  }
  /**
   * Return the byte array representation of the zkLogin public identifier
   */
  toRawBytes() {
    return __privateGet(this, _data);
  }
  /**
   * Return the Sui address associated with this ZkLogin public identifier
   */
  flag() {
    return import_signature_scheme.SIGNATURE_SCHEME_TO_FLAG["ZkLogin"];
  }
  /**
   * Verifies that the signature is valid for for the provided message
   */
  async verify(_message, _signature) {
    throw Error("does not support");
  }
  /**
   * Verifies that the signature is valid for for the provided PersonalMessage
   */
  verifyPersonalMessage(message, signature) {
    const parsedSignature = parseSerializedZkLoginSignature(signature);
    const address = new _ZkLoginPublicIdentifier(parsedSignature.publicKey).toSuiAddress();
    return graphqlVerifyZkLoginSignature({
      address,
      bytes: (0, import_bcs.toBase64)(message),
      signature: parsedSignature.serializedSignature,
      intentScope: "PERSONAL_MESSAGE",
      client: __privateGet(this, _client)
    });
  }
  /**
   * Verifies that the signature is valid for for the provided Transaction
   */
  verifyTransaction(transaction, signature) {
    const parsedSignature = parseSerializedZkLoginSignature(signature);
    const address = new _ZkLoginPublicIdentifier(parsedSignature.publicKey).toSuiAddress();
    return graphqlVerifyZkLoginSignature({
      address,
      bytes: (0, import_bcs.toBase64)(transaction),
      signature: parsedSignature.serializedSignature,
      intentScope: "TRANSACTION_DATA",
      client: __privateGet(this, _client)
    });
  }
  /**
   * Verifies that the public key is associated with the provided address
   */
  verifyAddress(address) {
    return address === super.toSuiAddress() || address === __privateMethod(this, _ZkLoginPublicIdentifier_instances, toLegacyAddress_fn).call(this);
  }
};
_data = new WeakMap();
_client = new WeakMap();
_legacyAddress = new WeakMap();
_ZkLoginPublicIdentifier_instances = new WeakSet();
toLegacyAddress_fn = function() {
  const legacyBytes = normalizeZkLoginPublicKeyBytes(__privateGet(this, _data), true);
  const addressBytes = new Uint8Array(legacyBytes.length + 1);
  addressBytes[0] = this.flag();
  addressBytes.set(legacyBytes, 1);
  return (0, import_sui_types.normalizeSuiAddress)(
    (0, import_utils.bytesToHex)((0, import_blake2b.blake2b)(addressBytes, { dkLen: 32 })).slice(0, import_sui_types.SUI_ADDRESS_LENGTH * 2)
  );
};
let ZkLoginPublicIdentifier = _ZkLoginPublicIdentifier;
function toZkLoginPublicIdentifier(addressSeed, iss, options) {
  const addressSeedBytesBigEndian = options?.legacyAddress ? (0, import_utils2.toBigEndianBytes)(addressSeed, 32) : (0, import_utils2.toPaddedBigEndianBytes)(addressSeed, 32);
  const issBytes = new TextEncoder().encode(iss);
  const tmp = new Uint8Array(1 + issBytes.length + addressSeedBytesBigEndian.length);
  tmp.set([issBytes.length], 0);
  tmp.set(issBytes, 1);
  tmp.set(addressSeedBytesBigEndian, 1 + issBytes.length);
  return new ZkLoginPublicIdentifier(tmp, options);
}
const VerifyZkLoginSignatureQuery = (0, import_latest.graphql)(`
	query Zklogin(
		$bytes: Base64!
		$signature: Base64!
		$intentScope: ZkLoginIntentScope!
		$author: SuiAddress!
	) {
		verifyZkloginSignature(
			bytes: $bytes
			signature: $signature
			intentScope: $intentScope
			author: $author
		) {
			success
			errors
		}
	}
`);
function normalizeZkLoginPublicKeyBytes(bytes, legacyAddress = false) {
  const issByteLength = bytes[0] + 1;
  const addressSeed = BigInt(`0x${(0, import_bcs.toHex)(bytes.slice(issByteLength))}`);
  const seedBytes = legacyAddress ? (0, import_utils2.toBigEndianBytes)(addressSeed, 32) : (0, import_utils2.toPaddedBigEndianBytes)(addressSeed, 32);
  const data = new Uint8Array(issByteLength + seedBytes.length);
  data.set(bytes.slice(0, issByteLength), 0);
  data.set(seedBytes, issByteLength);
  return data;
}
async function graphqlVerifyZkLoginSignature({
  address,
  bytes,
  signature,
  intentScope,
  client = new import_client.SuiGraphQLClient({
    url: "https://sui-mainnet.mystenlabs.com/graphql"
  })
}) {
  const resp = await client.query({
    query: VerifyZkLoginSignatureQuery,
    variables: {
      bytes,
      signature,
      intentScope,
      author: address
    }
  });
  return resp.data?.verifyZkloginSignature.success === true && resp.data?.verifyZkloginSignature.errors.length === 0;
}
function parseSerializedZkLoginSignature(signature) {
  const bytes = typeof signature === "string" ? (0, import_bcs.fromBase64)(signature) : signature;
  if (bytes[0] !== import_signature_scheme.SIGNATURE_SCHEME_TO_FLAG.ZkLogin) {
    throw new Error("Invalid signature scheme");
  }
  const signatureBytes = bytes.slice(1);
  const { inputs, maxEpoch, userSignature } = (0, import_signature.parseZkLoginSignature)(signatureBytes);
  const { issBase64Details, addressSeed } = inputs;
  const iss = (0, import_jwt_utils.extractClaimValue)(issBase64Details, "iss");
  const publicIdentifer = toZkLoginPublicIdentifier(BigInt(addressSeed), iss);
  return {
    serializedSignature: (0, import_bcs.toBase64)(bytes),
    signatureScheme: "ZkLogin",
    zkLogin: {
      inputs,
      maxEpoch,
      userSignature,
      iss,
      addressSeed: BigInt(addressSeed)
    },
    signature: bytes,
    publicKey: publicIdentifer.toRawBytes()
  };
}
//# sourceMappingURL=publickey.js.map
