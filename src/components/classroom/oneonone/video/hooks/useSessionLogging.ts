
import { useState } from "react";

export function useSessionLogging() {
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const logEvent = (msg: string) => {
    setLogMessages(old => [...old, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };
  return { logMessages, logEvent };
}
