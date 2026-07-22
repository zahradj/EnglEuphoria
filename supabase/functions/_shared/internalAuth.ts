// send-transactional-email (and the cron-triggered senders) are meant to be called
// only by other edge functions using the service-role client, never directly by a
// browser. This shared secret is the gate that enforces that. Set it once with:
//   supabase secrets set INTERNAL_FUNCTION_SECRET=<random-value>
// and every internal caller below attaches it automatically.
export const INTERNAL_SECRET_HEADER = 'x-internal-secret'

export function internalAuthHeaders(): Record<string, string> {
  const secret = Deno.env.get('INTERNAL_FUNCTION_SECRET')
  return secret ? { [INTERNAL_SECRET_HEADER]: secret } : {}
}

// Returns a 403 Response if the request isn't carrying the shared internal secret,
// or null if it's authorized to proceed.
export function requireInternalSecret(req: Request, corsHeaders: Record<string, string> = {}): Response | null {
  const expected = Deno.env.get('INTERNAL_FUNCTION_SECRET')
  const provided = req.headers.get(INTERNAL_SECRET_HEADER)
  if (!expected || provided !== expected) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  return null
}
