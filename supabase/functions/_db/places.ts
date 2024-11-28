import { PostgrestResponse, SupabaseClient } from "jsr:@supabase/supabase-js@2";

const TABLE_NAME = "places";

export interface Place {
    id: number;
    created_at: string;
    business_id: number;
    slug: string;
    name: string;
    accounts: string[];
    invite_code: string | null;
}

export const getPlacesByAccount = async (
    client: SupabaseClient,
    account: string,
): Promise<PostgrestResponse<Place>> => {
    return client
        .from(TABLE_NAME)
        .select("*")
        .contains("accounts", JSON.stringify([account]));
};
