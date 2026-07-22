import { useState, useCallback, useRef } from "react";

interface HistoryState {
  past: ImageData[];
  present: ImageData | null;
  future: ImageData[];
}

const MAX_HISTORY = 50;

export function useWhiteboardHistory(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: null,
    future: []
  });
  
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const captureCanvasState = useCallback((): ImageData | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, [canvasRef]);

  const restoreCanvasState = useCallback((imageData: ImageData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.putImageData(imageData, 0, 0);
  }, [canvasRef]);

  const saveState = useCallback(() => {
    // Debounce saves to avoid storing every pixel
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const currentState = captureCanvasState();
      if (!currentState) return;

      setHistory(prev => {
        const newPast = [...prev.past];
        if (prev.present) {
          newPast.push(prev.present);
        }

        // Limit history size
        if (newPast.length > MAX_HISTORY) {
          newPast.shift();
        }

        return {
          past: newPast,
          present: currentState,
          future: [] // Clear future when new action is performed
        };
      });
    }, 500);
  }, [captureCanvasState]);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;

      const newPast = [...prev.past];
      const newPresent = newPast.pop()!;
      const newFuture = prev.present ? [prev.present, ...prev.future] : prev.future;

      // Restore the canvas
      restoreCanvasState(newPresent);

      return {
        past: newPast,
        present: newPresent,
        future: newFuture
      };
    });
  }, [restoreCanvasState]);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;

      const newFuture = [...prev.future];
      const newPresent = newFuture.shift()!;
      const newPast = prev.present ? [...prev.past, prev.present] : prev.past;

      // Restore the canvas
      restoreCanvasState(newPresent);

      return {
        past: newPast,
        present: newPresent,
        future: newFuture
      };
    });
  }, [restoreCanvasState]);

  const clearHistory = useCallback(() => {
    setHistory({
      past: [],
      present: null,
      future: []
    });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    saveState,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    historyCount: history.past.length
  };
}
