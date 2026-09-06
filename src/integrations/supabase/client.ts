import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Hardcoded rather than read from import.meta.env.VITE_SUPABASE_URL / _PUBLISHABLE_KEY —
// those Vite env vars are not set in the production (Vercel) build, which silently
// produces the literal string "undefined" wherever they're read. These are the
// project's public anon-key values (safe to ship in the bundle either way), so
// every other file that needs them should import them from here instead of
// reading import.meta.env directly.
export const supabaseUrl = "https://dcoxpyzoqjvmuuygvlme.supabase.co"
export const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjb3hweXpvcWp2bXV1eWd2bG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTcxMzMsImV4cCI6MjA2NTUzMzEzM30.qWD7MJ3O7xrH2KBzIfPqGvVXigVaamR6DMVOW3rnO7s"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)