import { useCallback, useState } from "react";
import { runStoryArchitect, type StoryArchitectInput, type StoryArchitectResult } from "@/agents/storyArchitect";

export function useStoryArchitect() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StoryArchitectResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const craft = useCallback(async (input: StoryArchitectInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await runStoryArchitect(input);
      setResult(res);
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { craft, loading, result, error, reset: () => { setResult(null); setError(null); } };
}
