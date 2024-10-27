import type { Profile } from "jsr:@citizenwallet/sdk";
import type {
    PostgrestSingleResponse,
    SupabaseClient,
} from "jsr:@supabase/supabase-js@2";

const PROFILES_TABLE = "a_profiles";

export const upsertProfile = async (
    client: SupabaseClient,
    profile: Profile,
    tokenId: string,
): Promise<PostgrestSingleResponse<null>> => {
    return client
        .from(PROFILES_TABLE)
        .upsert({ ...profile, token_id: tokenId }, {
            onConflict: "account",
        });
};

export const getProfile = async (
    client: SupabaseClient,
    account: string,
): Promise<PostgrestSingleResponse<Profile | null>> => {
    return client.from(PROFILES_TABLE).select().eq("account", account)
        .maybeSingle();
};
