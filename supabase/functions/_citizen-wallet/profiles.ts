import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import type { CommunityConfig } from "jsr:@citizenwallet/sdk";
import {
    getProfile,
    insertAnonymousProfile,
    upsertProfile,
} from "../_db/profiles.ts";
import { getProfileFromAddress } from "./contracts/profiles/index.ts";

export const ensureProfileExists = async (
    client: SupabaseClient,
    config: CommunityConfig,
    address: string,
) => {
    const { data, error } = await getProfile(
        client,
        address,
    );

    if (error || !data) {
        // Check the smart contract for a profile
        const profile = await getProfileFromAddress(
            config,
            address,
        );

        if (profile) {
            await upsertProfile(client, profile);
        } else {
            // There is none, let's create an anonymous profile in the database
            await insertAnonymousProfile(
                client,
                address,
            );
        }
    }
};
