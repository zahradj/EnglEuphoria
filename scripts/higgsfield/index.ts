/**
 * Higgsfield + Seedance 2.5 text-to-video example (official SDK: @higgsfield/client).
 *
 * Run (server-side only; this makes a BILLABLE generation request):
 *   cd scripts/higgsfield && npm install && npm start
 *
 * Credentials: HF_CREDENTIALS="key-id:key-secret" in scripts/higgsfield/.env.local (git-ignored).
 * They are loaded by `tsx --env-file=.env.local` at runtime and are never printed or logged.
 * Never import this file from browser code.
 */
import { config, higgsfield } from '@higgsfield/client/v2';
import { APIError, AuthenticationError, CredentialsMissedError, NotEnoughCreditsError } from '@higgsfield/client/v2';

const MODEL = 'bytedance/seedance-2.5/text-to-video';

const credentials = process.env.HF_CREDENTIALS;
if (!credentials || !credentials.includes(':')) {
  console.error('HF_CREDENTIALS is missing or not in key-id:key-secret format. Put it in scripts/higgsfield/.env.local.');
  process.exit(2);
}
config({ credentials });

try {
  const result = await higgsfield.subscribe(MODEL, {
    input: {
      prompt: 'A cinematic scene at sunset',
      duration: 5,
      resolution: '720p',
      aspect_ratio: '16:9',
    },
    withPolling: true,
  });

  // Only a completed request with a video URL is a success.
  const status = String(result.status);
  const url = result.video?.url;
  if (status === 'completed' && url) {
    console.log(`Request ${result.request_id} completed.`);
    console.log(`Video URL: ${url}`);
  } else if (status === 'nsfw') {
    console.error(`Request ${result.request_id} was moderated (nsfw): no video was produced.`);
    process.exitCode = 1;
  } else if (status === 'failed' || status === 'canceled' || status === 'cancelled') {
    console.error(`Request ${result.request_id} ${status}: no video was produced.`);
    process.exitCode = 1;
  } else {
    console.error(`Request ${result.request_id} ended with status "${status}" and no video URL.`);
    process.exitCode = 1;
  }
} catch (e) {
  if (e instanceof NotEnoughCreditsError) console.error('Not enough Higgsfield credits.');
  else if (e instanceof AuthenticationError || e instanceof CredentialsMissedError) console.error('Higgsfield rejected the credentials.');
  else if (e instanceof APIError) console.error(`Higgsfield API error ${e.statusCode ?? ''}: ${e.message}`);
  else console.error(`Request failed: ${(e as Error).message}`);
  process.exitCode = 1;
}
