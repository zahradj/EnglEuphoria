import { useCallback, useState } from "react";
import {
  runVocabImageArchitect,
  runVocabImageBatch,
  type VocabImageInput,
  type VocabImageResult,
} from "@/agents/vocabImageArchitect";

export function useVocabImageArchitect() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<VocabImageResult[]>([]);

  const craftOne = useCallback(async (input: VocabImageInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await runVocabImageArchitect(input);
      setResults((r) => [...r, res]);
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const craftMany = useCallback(async (inputs: VocabImageInput[]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await runVocabImageBatch(inputs);
      setResults(res);
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { craftOne, craftMany, loading, error, results, reset: () => setResults([]) };
}
