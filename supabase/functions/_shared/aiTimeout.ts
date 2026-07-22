// Wrap any Promise (typically an AI fetch) with a hard timeout so the UI
// never freezes waiting on a stalled Gemini response.

export async function withTimeout<T>(
  promise: Promise<T>,
  ms = 25_000,
  label = "AI call",
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms — AI is taking a coffee break.`)),
      ms,
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
