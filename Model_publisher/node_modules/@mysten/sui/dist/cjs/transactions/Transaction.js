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
var Transaction_exports = {};
__export(Transaction_exports, {
  Transaction: () => Transaction,
  isTransaction: () => isTransaction
});
module.exports = __toCommonJS(Transaction_exports);
var import_bcs = require("@mysten/bcs");
var import_valibot = require("valibot");
var import_sui_types = require("../utils/sui-types.js");
var import_Commands = require("./Commands.js");
var import_internal = require("./data/internal.js");
var import_v1 = require("./data/v1.js");
var import_v2 = require("./data/v2.js");
var import_Inputs = require("./Inputs.js");
var import_json_rpc_resolver = require("./json-rpc-resolver.js");
var import_object = require("./object.js");
var import_pure = require("./pure.js");
var import_TransactionData = require("./TransactionData.js");
var import_utils = require("./utils.js");
var _serializationPlugins, _buildPlugins, _intentResolvers, _data, _Transaction_instances, normalizeTransactionArgument_fn, resolveArgument_fn, prepareBuild_fn, runPlugins_fn;
function createTransactionResult(index, length = Infinity) {
  const baseResult = { $kind: "Result", Result: index };
  const nestedResults = [];
  const nestedResultFor = (resultIndex) => nestedResults[resultIndex] ?? (nestedResults[resultIndex] = {
    $kind: "NestedResult",
    NestedResult: [index, resultIndex]
  });
  return new Proxy(baseResult, {
    set() {
      throw new Error(
        "The transaction result is a proxy, and does not support setting properties directly"
      );
    },
    // TODO: Instead of making this return a concrete argument, we should ideally
    // make it reference-based (so that this gets resolved at build-time), which
    // allows re-ordering transactions.
    get(target, property) {
      if (property in target) {
        return Reflect.get(target, property);
      }
      if (property === Symbol.iterator) {
        return function* () {
          let i = 0;
          while (i < length) {
            yield nestedResultFor(i);
            i++;
          }
        };
      }
      if (typeof property === "symbol") return;
      const resultIndex = parseInt(property, 10);
      if (Number.isNaN(resultIndex) || resultIndex < 0) return;
      return nestedResultFor(resultIndex);
    }
  });
}
const TRANSACTION_BRAND = Symbol.for("@mysten/transaction");
function isTransaction(obj) {
  return !!obj && typeof obj === "object" && obj[TRANSACTION_BRAND] === true;
}
const modulePluginRegistry = {
  buildPlugins: /* @__PURE__ */ new Map(),
  serializationPlugins: /* @__PURE__ */ new Map()
};
const TRANSACTION_REGISTRY_KEY = Symbol.for("@mysten/transaction/registry");
function getGlobalPluginRegistry() {
  try {
    const target = globalThis;
    if (!target[TRANSACTION_REGISTRY_KEY]) {
      target[TRANSACTION_REGISTRY_KEY] = modulePluginRegistry;
    }
    return target[TRANSACTION_REGISTRY_KEY];
  } catch (e) {
    return modulePluginRegistry;
  }
}
const _Transaction = class _Transaction {
  constructor() {
    __privateAdd(this, _Transaction_instances);
    __privateAdd(this, _serializationPlugins);
    __privateAdd(this, _buildPlugins);
    __privateAdd(this, _intentResolvers, /* @__PURE__ */ new Map());
    __privateAdd(this, _data);
    /**
     * Add a new object input to the transaction.
     */
    this.object = (0, import_object.createObjectMethods)(
      (value) => {
        if (typeof value === "function") {
          return this.object(value(this));
        }
        if (typeof value === "object" && (0, import_valibot.is)(import_internal.Argument, value)) {
          return value;
        }
        const id = (0, import_utils.getIdFromCallArg)(value);
        const inserted = __privateGet(this, _data).inputs.find((i) => id === (0, import_utils.getIdFromCallArg)(i));
        if (inserted?.Object?.SharedObject && typeof value === "object" && value.Object?.SharedObject) {
          inserted.Object.SharedObject.mutable = inserted.Object.SharedObject.mutable || value.Object.SharedObject.mutable;
        }
        return inserted ? { $kind: "Input", Input: __privateGet(this, _data).inputs.indexOf(inserted), type: "object" } : __privateGet(this, _data).addInput(
          "object",
          typeof value === "string" ? {
            $kind: "UnresolvedObject",
            UnresolvedObject: { objectId: (0, import_sui_types.normalizeSuiAddress)(value) }
          } : value
        );
      }
    );
    const globalPlugins = getGlobalPluginRegistry();
    __privateSet(this, _data, new import_TransactionData.TransactionDataBuilder());
    __privateSet(this, _buildPlugins, [...globalPlugins.buildPlugins.values()]);
    __privateSet(this, _serializationPlugins, [...globalPlugins.serializationPlugins.values()]);
  }
  /**
   * Converts from a serialize transaction kind (built with `build({ onlyTransactionKind: true })`) to a `Transaction` class.
   * Supports either a byte array, or base64-encoded bytes.
   */
  static fromKind(serialized) {
    const tx = new _Transaction();
    __privateSet(tx, _data, import_TransactionData.TransactionDataBuilder.fromKindBytes(
      typeof serialized === "string" ? (0, import_bcs.fromBase64)(serialized) : serialized
    ));
    return tx;
  }
  /**
   * Converts from a serialized transaction format to a `Transaction` class.
   * There are two supported serialized formats:
   * - A string returned from `Transaction#serialize`. The serialized format must be compatible, or it will throw an error.
   * - A byte array (or base64-encoded bytes) containing BCS transaction data.
   */
  static from(transaction) {
    const newTransaction = new _Transaction();
    if (isTransaction(transaction)) {
      __privateSet(newTransaction, _data, new import_TransactionData.TransactionDataBuilder(transaction.getData()));
    } else if (typeof transaction !== "string" || !transaction.startsWith("{")) {
      __privateSet(newTransaction, _data, import_TransactionData.TransactionDataBuilder.fromBytes(
        typeof transaction === "string" ? (0, import_bcs.fromBase64)(transaction) : transaction
      ));
    } else {
      __privateSet(newTransaction, _data, import_TransactionData.TransactionDataBuilder.restore(JSON.parse(transaction)));
    }
    return newTransaction;
  }
  static registerGlobalSerializationPlugin(stepOrStep, step) {
    getGlobalPluginRegistry().serializationPlugins.set(
      stepOrStep,
      step ?? stepOrStep
    );
  }
  static unregisterGlobalSerializationPlugin(name) {
    getGlobalPluginRegistry().serializationPlugins.delete(name);
  }
  static registerGlobalBuildPlugin(stepOrStep, step) {
    getGlobalPluginRegistry().buildPlugins.set(
      stepOrStep,
      step ?? stepOrStep
    );
  }
  static unregisterGlobalBuildPlugin(name) {
    getGlobalPluginRegistry().buildPlugins.delete(name);
  }
  addSerializationPlugin(step) {
    __privateGet(this, _serializationPlugins).push(step);
  }
  addBuildPlugin(step) {
    __privateGet(this, _buildPlugins).push(step);
  }
  addIntentResolver(intent, resolver) {
    if (__privateGet(this, _intentResolvers).has(intent) && __privateGet(this, _intentResolvers).get(intent) !== resolver) {
      throw new Error(`Intent resolver for ${intent} already exists`);
    }
    __privateGet(this, _intentResolvers).set(intent, resolver);
  }
  setSender(sender) {
    __privateGet(this, _data).sender = sender;
  }
  /**
   * Sets the sender only if it has not already been set.
   * This is useful for sponsored transaction flows where the sender may not be the same as the signer address.
   */
  setSenderIfNotSet(sender) {
    if (!__privateGet(this, _data).sender) {
      __privateGet(this, _data).sender = sender;
    }
  }
  setExpiration(expiration) {
    __privateGet(this, _data).expiration = expiration ? (0, import_valibot.parse)(import_internal.TransactionExpiration, expiration) : null;
  }
  setGasPrice(price) {
    __privateGet(this, _data).gasConfig.price = String(price);
  }
  setGasBudget(budget) {
    __privateGet(this, _data).gasConfig.budget = String(budget);
  }
  setGasBudgetIfNotSet(budget) {
    if (__privateGet(this, _data).gasData.budget == null) {
      __privateGet(this, _data).gasConfig.budget = String(budget);
    }
  }
  setGasOwner(owner) {
    __privateGet(this, _data).gasConfig.owner = owner;
  }
  setGasPayment(payments) {
    __privateGet(this, _data).gasConfig.payment = payments.map((payment) => (0, import_valibot.parse)(import_internal.ObjectRef, payment));
  }
  /** @deprecated Use `getData()` instead. */
  get blockData() {
    return (0, import_v1.serializeV1TransactionData)(__privateGet(this, _data).snapshot());
  }
  /** Get a snapshot of the transaction data, in JSON form: */
  getData() {
    return __privateGet(this, _data).snapshot();
  }
  // Used to brand transaction classes so that they can be identified, even between multiple copies
  // of the builder.
  get [TRANSACTION_BRAND]() {
    return true;
  }
  // Temporary workaround for the wallet interface accidentally serializing transactions via postMessage
  get pure() {
    Object.defineProperty(this, "pure", {
      enumerable: false,
      value: (0, import_pure.createPure)((value) => {
        if ((0, import_bcs.isSerializedBcs)(value)) {
          return __privateGet(this, _data).addInput("pure", {
            $kind: "Pure",
            Pure: {
              bytes: value.toBase64()
            }
          });
        }
        return __privateGet(this, _data).addInput(
          "pure",
          (0, import_valibot.is)(import_internal.NormalizedCallArg, value) ? (0, import_valibot.parse)(import_internal.NormalizedCallArg, value) : value instanceof Uint8Array ? import_Inputs.Inputs.Pure(value) : { $kind: "UnresolvedPure", UnresolvedPure: { value } }
        );
      })
    });
    return this.pure;
  }
  /** Returns an argument for the gas coin, to be used in a transaction. */
  get gas() {
    return { $kind: "GasCoin", GasCoin: true };
  }
  /**
   * Add a new object input to the transaction using the fully-resolved object reference.
   * If you only have an object ID, use `builder.object(id)` instead.
   */
  objectRef(...args) {
    return this.object(import_Inputs.Inputs.ObjectRef(...args));
  }
  /**
   * Add a new receiving input to the transaction using the fully-resolved object reference.
   * If you only have an object ID, use `builder.object(id)` instead.
   */
  receivingRef(...args) {
    return this.object(import_Inputs.Inputs.ReceivingRef(...args));
  }
  /**
   * Add a new shared object input to the transaction using the fully-resolved shared object reference.
   * If you only have an object ID, use `builder.object(id)` instead.
   */
  sharedObjectRef(...args) {
    return this.object(import_Inputs.Inputs.SharedObjectRef(...args));
  }
  /** Add a transaction to the transaction */
  add(command) {
    if (typeof command === "function") {
      return command(this);
    }
    const index = __privateGet(this, _data).commands.push(command);
    return createTransactionResult(index - 1);
  }
  // Method shorthands:
  splitCoins(coin, amounts) {
    const command = import_Commands.Commands.SplitCoins(
      typeof coin === "string" ? this.object(coin) : __privateMethod(this, _Transaction_instances, resolveArgument_fn).call(this, coin),
      amounts.map(
        (amount) => typeof amount === "number" || typeof amount === "bigint" || typeof amount === "string" ? this.pure.u64(amount) : __privateMethod(this, _Transaction_instances, normalizeTransactionArgument_fn).call(this, amount)
      )
    );
    const index = __privateGet(this, _data).commands.push(command);
    return createTransactionResult(index - 1, amounts.length);
  }
  mergeCoins(destination, sources) {
    return this.add(
      import_Commands.Commands.MergeCoins(
        this.object(destination),
        sources.map((src) => this.object(src))
      )
    );
  }
  publish({ modules, dependencies }) {
    return this.add(
      import_Commands.Commands.Publish({
        modules,
        dependencies
      })
    );
  }
  upgrade({
    modules,
    dependencies,
    package: packageId,
    ticket
  }) {
    return this.add(
      import_Commands.Commands.Upgrade({
        modules,
        dependencies,
        package: packageId,
        ticket: this.object(ticket)
      })
    );
  }
  moveCall({
    arguments: args,
    ...input
  }) {
    return this.add(
      import_Commands.Commands.MoveCall({
        ...input,
        arguments: args?.map((arg) => __privateMethod(this, _Transaction_instances, normalizeTransactionArgument_fn).call(this, arg))
      })
    );
  }
  transferObjects(objects, address) {
    return this.add(
      import_Commands.Commands.TransferObjects(
        objects.map((obj) => this.object(obj)),
        typeof address === "string" ? this.pure.address(address) : __privateMethod(this, _Transaction_instances, normalizeTransactionArgument_fn).call(this, address)
      )
    );
  }
  makeMoveVec({
    type,
    elements
  }) {
    return this.add(
      import_Commands.Commands.MakeMoveVec({
        type,
        elements: elements.map((obj) => this.object(obj))
      })
    );
  }
  /**
   * @deprecated Use toJSON instead.
   * For synchronous serialization, you can use `getData()`
   * */
  serialize() {
    return JSON.stringify((0, import_v1.serializeV1TransactionData)(__privateGet(this, _data).snapshot()));
  }
  async toJSON(options = {}) {
    await this.prepareForSerialization(options);
    return JSON.stringify(
      (0, import_valibot.parse)(import_v2.SerializedTransactionDataV2, __privateGet(this, _data).snapshot()),
      (_key, value) => typeof value === "bigint" ? value.toString() : value,
      2
    );
  }
  /** Build the transaction to BCS bytes, and sign it with the provided keypair. */
  async sign(options) {
    const { signer, ...buildOptions } = options;
    const bytes = await this.build(buildOptions);
    return signer.signTransaction(bytes);
  }
  /** Build the transaction to BCS bytes. */
  async build(options = {}) {
    await this.prepareForSerialization(options);
    await __privateMethod(this, _Transaction_instances, prepareBuild_fn).call(this, options);
    return __privateGet(this, _data).build({
      onlyTransactionKind: options.onlyTransactionKind
    });
  }
  /** Derive transaction digest */
  async getDigest(options = {}) {
    await __privateMethod(this, _Transaction_instances, prepareBuild_fn).call(this, options);
    return __privateGet(this, _data).getDigest();
  }
  async prepareForSerialization(options) {
    const intents = /* @__PURE__ */ new Set();
    for (const command of __privateGet(this, _data).commands) {
      if (command.$Intent) {
        intents.add(command.$Intent.name);
      }
    }
    const steps = [...__privateGet(this, _serializationPlugins)];
    for (const intent of intents) {
      if (options.supportedIntents?.includes(intent)) {
        continue;
      }
      if (!__privateGet(this, _intentResolvers).has(intent)) {
        throw new Error(`Missing intent resolver for ${intent}`);
      }
      steps.push(__privateGet(this, _intentResolvers).get(intent));
    }
    await __privateMethod(this, _Transaction_instances, runPlugins_fn).call(this, steps, options);
  }
};
_serializationPlugins = new WeakMap();
_buildPlugins = new WeakMap();
_intentResolvers = new WeakMap();
_data = new WeakMap();
_Transaction_instances = new WeakSet();
normalizeTransactionArgument_fn = function(arg) {
  if ((0, import_bcs.isSerializedBcs)(arg)) {
    return this.pure(arg);
  }
  return __privateMethod(this, _Transaction_instances, resolveArgument_fn).call(this, arg);
};
resolveArgument_fn = function(arg) {
  if (typeof arg === "function") {
    return (0, import_valibot.parse)(import_internal.Argument, arg(this));
  }
  return (0, import_valibot.parse)(import_internal.Argument, arg);
};
prepareBuild_fn = async function(options) {
  if (!options.onlyTransactionKind && !__privateGet(this, _data).sender) {
    throw new Error("Missing transaction sender");
  }
  await __privateMethod(this, _Transaction_instances, runPlugins_fn).call(this, [...__privateGet(this, _buildPlugins), import_json_rpc_resolver.resolveTransactionData], options);
};
runPlugins_fn = async function(plugins, options) {
  const createNext = (i) => {
    if (i >= plugins.length) {
      return () => {
      };
    }
    const plugin = plugins[i];
    return async () => {
      const next = createNext(i + 1);
      let calledNext = false;
      let nextResolved = false;
      await plugin(__privateGet(this, _data), options, async () => {
        if (calledNext) {
          throw new Error(`next() was call multiple times in TransactionPlugin ${i}`);
        }
        calledNext = true;
        await next();
        nextResolved = true;
      });
      if (!calledNext) {
        throw new Error(`next() was not called in TransactionPlugin ${i}`);
      }
      if (!nextResolved) {
        throw new Error(`next() was not awaited in TransactionPlugin ${i}`);
      }
    };
  };
  await createNext(0)();
};
let Transaction = _Transaction;
//# sourceMappingURL=Transaction.js.map
