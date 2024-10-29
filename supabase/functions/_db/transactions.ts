import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import type { LogStatus } from "jsr:@citizenwallet/sdk";

export interface Transaction {
    id: string;
    hash: string;
    created_at: string;
    updated_at: string;
    from: string;
    to: string;
    value: string;
    status: LogStatus;
}

export interface TransactionWithDescription {
    id: string;
    description: string;
}

const TRANSACTIONS_TABLE = "a_transactions";

export const upsertTransaction = async (
    client: SupabaseClient,
    transaction: Transaction,
) => {
    return client.from(TRANSACTIONS_TABLE).upsert(transaction, {
        onConflict: "id",
    });
};

export const upsertTransactionWithDescription = async (
    client: SupabaseClient,
    transaction: TransactionWithDescription,
) => {
    return client.from(TRANSACTIONS_TABLE).upsert(transaction, {
        onConflict: "id",
    });
};
