import { useEffect } from "react";

export function useEscape(action: () => void) {
  useEffect(() => {
    const abort = new AbortController();
    window.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape") {
          action();
        }
      },
      {
        signal: abort.signal,
      }
    );
    return () => abort.abort();
  }, []);
}
