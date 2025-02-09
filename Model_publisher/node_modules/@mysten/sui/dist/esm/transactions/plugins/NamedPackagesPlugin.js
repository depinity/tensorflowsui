import { findTransactionBlockNames, listToRequests, replaceNames } from "./utils.js";
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
    const names = findTransactionBlockNames(transactionData);
    const batches = listToRequests(
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
    replaceNames(transactionData, cache);
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
export {
  namedPackagesPlugin
};
//# sourceMappingURL=NamedPackagesPlugin.js.map
