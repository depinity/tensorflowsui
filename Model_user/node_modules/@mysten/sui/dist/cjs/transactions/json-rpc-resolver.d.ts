import type { SuiClient } from '../client/client.js';
import type { TransactionDataBuilder } from './TransactionData.js';
export interface BuildTransactionOptions {
    client?: SuiClient;
    onlyTransactionKind?: boolean;
}
export interface SerializeTransactionOptions extends BuildTransactionOptions {
    supportedIntents?: string[];
}
export type TransactionPlugin = (transactionData: TransactionDataBuilder, options: BuildTransactionOptions, next: () => Promise<void>) => Promise<void>;
export declare function resolveTransactionData(transactionData: TransactionDataBuilder, options: BuildTransactionOptions, next: () => Promise<void>): Promise<void>;
export declare function getClient(options: BuildTransactionOptions): SuiClient;
