import type { Transaction } from '../Transaction.js';
export declare function coinWithBalance({ type, balance, useGasCoin, }: {
    balance: bigint | number;
    type?: string;
    useGasCoin?: boolean;
}): (tx: Transaction) => import("../Transaction.js").TransactionResult;
