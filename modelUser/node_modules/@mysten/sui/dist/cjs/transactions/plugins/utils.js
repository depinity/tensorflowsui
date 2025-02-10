"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var utils_exports = {};
__export(utils_exports, {
  findTransactionBlockNames: () => findTransactionBlockNames,
  listToRequests: () => listToRequests,
  replaceNames: () => replaceNames
});
module.exports = __toCommonJS(utils_exports);
var import_move_registry = require("../../utils/move-registry.js");
const NAME_SEPARATOR = "/";
const findTransactionBlockNames = (builder) => {
  const packages = /* @__PURE__ */ new Set();
  const types = /* @__PURE__ */ new Set();
  for (const command of builder.commands) {
    if (command.MakeMoveVec?.type) {
      getNamesFromTypeList([command.MakeMoveVec.type]).forEach((type) => {
        types.add(type);
      });
      continue;
    }
    if (!("MoveCall" in command)) continue;
    const tx = command.MoveCall;
    if (!tx) continue;
    const pkg = tx.package.split("::")[0];
    if (pkg.includes(NAME_SEPARATOR)) {
      if (!(0, import_move_registry.isValidNamedPackage)(pkg)) throw new Error(`Invalid package name: ${pkg}`);
      packages.add(pkg);
    }
    getNamesFromTypeList(tx.typeArguments ?? []).forEach((type) => {
      types.add(type);
    });
  }
  return {
    packages: [...packages],
    types: [...types]
  };
};
function getNamesFromTypeList(types) {
  const names = /* @__PURE__ */ new Set();
  for (const type of types) {
    if (type.includes(NAME_SEPARATOR)) {
      if (!(0, import_move_registry.isValidNamedType)(type)) throw new Error(`Invalid type with names: ${type}`);
      names.add(type);
    }
  }
  return [...names];
}
const replaceNames = (builder, cache) => {
  for (const command of builder.commands) {
    if (command.MakeMoveVec?.type) {
      if (!command.MakeMoveVec.type.includes(NAME_SEPARATOR)) continue;
      if (!cache.types[command.MakeMoveVec.type])
        throw new Error(`No resolution found for type: ${command.MakeMoveVec.type}`);
      command.MakeMoveVec.type = cache.types[command.MakeMoveVec.type];
    }
    const tx = command.MoveCall;
    if (!tx) continue;
    const nameParts = tx.package.split("::");
    const name = nameParts[0];
    if (name.includes(NAME_SEPARATOR) && !cache.packages[name])
      throw new Error(`No address found for package: ${name}`);
    if (name.includes(NAME_SEPARATOR)) {
      nameParts[0] = cache.packages[name];
      tx.package = nameParts.join("::");
    }
    const types = tx.typeArguments;
    if (!types) continue;
    for (let i = 0; i < types.length; i++) {
      if (!types[i].includes(NAME_SEPARATOR)) continue;
      if (!cache.types[types[i]]) throw new Error(`No resolution found for type: ${types[i]}`);
      types[i] = cache.types[types[i]];
    }
    tx.typeArguments = types;
  }
};
const listToRequests = (names, batchSize) => {
  const results = [];
  const uniqueNames = deduplicate(names.packages);
  const uniqueTypes = deduplicate(names.types);
  for (const [idx, name] of uniqueNames.entries()) {
    results.push({ id: idx, type: "package", name });
  }
  for (const [idx, type] of uniqueTypes.entries()) {
    results.push({
      id: idx + uniqueNames.length,
      type: "moveType",
      name: type
    });
  }
  return batch(results, batchSize);
};
const deduplicate = (arr) => [...new Set(arr)];
const batch = (arr, size) => {
  const batches = [];
  for (let i = 0; i < arr.length; i += size) {
    batches.push(arr.slice(i, i + size));
  }
  return batches;
};
//# sourceMappingURL=utils.js.map
