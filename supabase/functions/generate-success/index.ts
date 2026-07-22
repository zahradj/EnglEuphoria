import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleBrainRequest, corsHeaders } from "../_shared/hub-brain.ts";
import { SUCCESS_BRAIN_PROMPT } from "../_shared/prompts/success.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  return handleBrainRequest("success", SUCCESS_BRAIN_PROMPT, req);
});
