import type { TransactionDataBuilder } from '../TransactionData.js';
export type NamedPackagesPluginCache = {
    packages: Record<string, string>;
    types: Record<string, string>;
};
export type NameResolutionRequest = {
    id: number;
    type: 'package' | 'moveType';
    name: string;
};
/**
 * Looks up all `.move` names in a transaction block.
 * Returns a list of all the names found.
 */
export declare const findTransactionBlockNames: (builder: TransactionDataBuilder) => {
    packages: string[];
    types: string[];
};
/**
 * Replace all names & types in a transaction block
 * with their resolved names/types.
 */
export declare const replaceNames: (builder: TransactionDataBuilder, cache: NamedPackagesPluginCache) => void;
export declare const listToRequests: (names: {
    packages: string[];
    types: string[];
}, batchSize: number) => NameResolutionRequest[][];
