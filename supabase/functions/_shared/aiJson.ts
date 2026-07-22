// Shared sanitizer + raw-JSON instruction for all AI edge functions.
// Strips Gemini's markdown fences / prose wrapping before JSON.parse so that
// a chatty model never crashes a slide- or curriculum-generation pipeline.

export const RAW_JSON_INSTRUCTION =
  "CRITICAL OUTPUT RULE: Return ONLY raw, valid JSON. Do NOT wrap the response " +
  "in ```json fences, do NOT add prose before or after, do NOT include comments. " +
  "Your entire response must be parseable by JSON.parse on the first character.";

export function stripJsonFences(raw: string): string {
  let s = (raw ?? "").trim();
  // Strip ```json ... ``` or ``` ... ``` fences
  s = s.replace(/^```(?:json|JSON)?\s*/i, "").replace(/```\s*$/i, "").trim();
  // Slice to outermost { ... } or [ ... ]
  const firstObj = s.indexOf("{");
  const firstArr = s.indexOf("[");
  let start = -1;
  if (firstObj === -1) start = firstArr;
  else if (firstArr === -1) start = firstObj;
  else start = Math.min(firstObj, firstArr);
  const lastObj = s.lastIndexOf("}");
  const lastArr = s.lastIndexOf("]");
  const end = Math.max(lastObj, lastArr);
  if (start >= 0 && end > start) s = s.slice(start, end + 1);
  return s;
}

export function parseAIJson<T = unknown>(raw: string, contextLabel = "AI"): T {
  const cleaned = stripJsonFences(raw);
  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.error(
      `[${contextLabel}] Failed to parse AI JSON. First 800 chars:`,
      (raw ?? "").substring(0, 800),
    );
    throw new Error(
      "AI returned malformed data. Please try generating again.",
    );
  }
}
