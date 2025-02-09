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
var NamedPackagesPlugin_exports = {};
__export(NamedPackagesPlugin_exports, {
  namedPackagesPlugin: () => namedPackagesPlugin
});
module.exports = __toCommonJS(NamedPackagesPlugin_exports);
var import_utils = require("./utils.js");
const namedPackagesPlugin = ({
  suiGraphQLClient,
  pageSize = 10,
  overrides = { packages: {}, types: {} }
}) => {
  const cache = {
    packages: { ...overrides.packages },
    types: { ...overrides.types }
  };
  return async (transactionData, _buildOptions, next) => {
    const names = (0, import_utils.findTransactionBlockNames)(transactionData);
    const batches = (0, import_utils.listToRequests)(
      {
        packages: names.packages.filter((x) => !cache.packages[x]),
        types: names.types.filter((x) => !cache.types[x])
      },
      pageSize
    );
    (await Promise.all(batches.map((batch) => query(suiGraphQLClient, batch)))).forEach((res) => {
      Object.assign(cache.types, res.types);
      Object.assign(cache.packages, res.packages);
    });
    (0, import_utils.replaceNames)(transactionData, cache);
    await next();
  };
  async function query(client, requests) {
    const results = { packages: {}, types: {} };
    if (requests.length === 0) return results;
    const gqlQuery = `{
        ${requests.map((req) => {
      const request = req.type === "package" ? "packageByName" : "typeByName";
      const fields = req.type === "package" ? "address" : "repr";
      return `${gqlQueryKey(req.id)}: ${request}(name:"${req.name}") {
                    ${fields}
                }`;
    })}
    }`;
    const result = await client.query({
      query: gqlQuery,
      variables: void 0
    });
    if (result.errors) throw new Error(JSON.stringify({ query: gqlQuery, errors: result.errors }));
    for (const req of requests) {
      const key = gqlQueryKey(req.id);
      if (!result.data || !result.data[key]) throw new Error(`No result found for: ${req.name}`);
      const data = result.data[key];
      if (req.type === "package") results.packages[req.name] = data.address;
      if (req.type === "moveType") results.types[req.name] = data.repr;
    }
    return results;
  }
};
const gqlQueryKey = (idx) => `key_${idx}`;
//# sourceMappingURL=NamedPackagesPlugin.js.map
