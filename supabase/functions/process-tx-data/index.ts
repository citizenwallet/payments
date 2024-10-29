// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { type ERC20TransferExtraData } from "../_citizen-wallet/index.ts";
import { getServiceRoleClient } from "../_db/index.ts";
import {
  type TransactionWithDescription,
  upsertTransactionWithDescription,
} from "../_db/transactions.ts";

Deno.serve(async (req) => {
  const { record } = await req.json();

  console.log("record", record);

  if (!record || typeof record !== "object") {
    return new Response("Invalid record data", { status: 400 });
  }

  const {
    hash,
    extra_data,
  } = record;

  // Initialize Supabase client
  const supabaseClient = getServiceRoleClient();

  let erc20TransferExtraData: ERC20TransferExtraData = { description: "" };
  if (extra_data) {
    erc20TransferExtraData = extra_data as ERC20TransferExtraData;
  }

  // insert transaction into db
  const transaction: TransactionWithDescription = {
    id: hash,
    description: erc20TransferExtraData.description || "",
  };

  const { error } = await upsertTransactionWithDescription(
    supabaseClient,
    transaction,
  );
  if (error) {
    console.error("Error inserting transaction:", error);
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
