import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

const TOKENS_TABLE = "t_push_token";

export const getTokensForAddress = async (
    client: SupabaseClient,
    chainId: string,
    contractAddress: string,
    address: string,
) => {
    return client
        .from(`${TOKENS_TABLE}_${chainId}_${contractAddress.toLowerCase()}`)
        .select("token")
        .eq("account", address);
};
