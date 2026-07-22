// Standardized error responder for AI edge functions.
// Always returns JSON + CORS headers so the frontend never sees a raw 502.

export function classifyAIError(err: unknown): { status: number; message: string } {
  const msg = err instanceof Error ? err.message : String(err ?? "Unknown error");
  const lower = msg.toLowerCase();
  if (lower.includes("429") || lower.includes("rate limit")) {
    return { status: 429, message: "Rate limit reached. Please wait a moment and try again." };
  }
  if (lower.includes("402") || lower.includes("credits") || lower.includes("payment required")) {
    return { status: 402, message: "AI credits exhausted. Add credits in Workspace → Usage." };
  }
  if (lower.includes("timeout") || lower.includes("timed out") || lower.includes("coffee break")) {
    return { status: 504, message: "Oops, our AI is taking a coffee break. Try clicking generate again!" };
  }
  if (lower.includes("malformed")) {
    return { status: 502, message: msg };
  }
  return { status: 500, message: msg };
}

export function aiErrorResponse(
  err: unknown,
  corsHeaders: Record<string, string>,
  forcedStatus?: number,
): Response {
  const { status, message } = classifyAIError(err);
  console.error("[aiErrorResponse]", message, err);
  return new Response(
    JSON.stringify({ error: message }),
    {
      status: forcedStatus ?? status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
