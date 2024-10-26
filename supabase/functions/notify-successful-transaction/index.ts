// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendNotification } from "../_firebase/index.ts";
import {
  communityConfig,
  createERC20TransferNotification,
  type ERC20TransferData,
} from "../_citizen-wallet/index.ts";

Deno.serve(async (req) => {
  const { record } = await req.json();

  console.log("record", record);

  if (!record || typeof record !== "object") {
    return new Response("Invalid record data", { status: 400 });
  }

  const { dest, sender, value, tx_hash, status, data } = record;

  if (!dest || typeof dest !== "string") {
    return new Response(
      "Destination address is required and must be a string",
      { status: 400 },
    );
  }

  const community = await communityConfig();

  if (dest.toLowerCase() !== community.primaryToken.address.toLowerCase()) {
    return new Response("Only process primary token transfers", {
      status: 200,
    });
  }

  if (status !== "success") {
    return new Response("Transaction status is not success, ignoring", {
      status: 200,
    });
  }

  // Initialize Supabase client
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    },
  );

  const chainId = Deno.env.get("CHAIN_ID");
  if (!chainId) {
    return new Response("CHAIN_ID is required", { status: 500 });
  }

  // Fetch tokens for the destination address (contract interacted with)
  const { data: tokens, error } = await supabaseClient
    .from(`t_push_token_${chainId}_${dest.toLowerCase()}`)
    .select("token");

  if (error) {
    console.error("Error fetching tokens:", error);
    return new Response("Error fetching tokens", { status: 500 });
  }

  if (!tokens || tokens.length === 0) {
    return new Response("No tokens found for the account", { status: 200 });
  }

  const erc20TransferData = data as ERC20TransferData;

  const notification = createERC20TransferNotification(
    community,
    erc20TransferData,
  );

  // Prepare the notification message
  const message = {
    tokens: tokens.map((t) => t.token),
    notification,
    data: {
      tx_hash,
      sender,
      dest,
      value,
    },
    android: {
      priority: "high" as "high", // Ensure notifications are always sent with high priority
    },
    apns: {
      payload: {
        aps: {
          sound: "default", // Ensure notifications trigger a sound on iOS
        },
      },
    },
  };

  // Send the notification
  const failedTokens = await sendNotification(message);

  // Optionally, you can handle failed tokens here
  if (failedTokens.length > 0) {
    console.warn("Failed to send notifications to some tokens:", failedTokens);
  }

  return new Response("notification sent", { status: 200 });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/notify-successful-transaction' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
