import { isValidNamedPackage, isValidNamedType } from "../../utils/move-registry.js";
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
      if (!isValidNamedPackage(pkg)) throw new Error(`Invalid package name: ${pkg}`);
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
      if (!isValidNamedType(type)) throw new Error(`Invalid type with names: ${type}`);
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
export {
  findTransactionBlockNames,
  listToRequests,
  replaceNames
};
//# sourceMappingURL=utils.js.map
