import { useEffect, useRef, useState } from "react";

/**
 * How long a copy button shows its confirmation or failure before resetting.
 */
const FEEDBACK_MS = 1500;

type CopyStatus = "idle" | "copied" | "failed";

/**
 * The clipboard write, rejected when the API is missing (e.g. plain http) or
 * denied.
 */
const writeToClipboard = (text: string): Promise<void> => {
  if (!navigator.clipboard) {
    return Promise.reject(new Error("Clipboard API unavailable"));
  }

  return navigator.clipboard.writeText(text);
};

/**
 * Copies text to the clipboard and reports how it went for a moment, so the
 * button can show a "copied" or "failed" bubble.
 */
export const useCopyFeedback = () => {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // A pending reset must not fire on an unmounted button.
  useEffect(
    () => () => {
      clearTimeout(resetTimer.current);
    },
    [],
  );

  const showFor = (result: CopyStatus) => {
    // A second copy restarts the window instead of being cut short by the
    // first.
    clearTimeout(resetTimer.current);
    setStatus(result);
    resetTimer.current = setTimeout(() => {
      setStatus("idle");
    }, FEEDBACK_MS);
  };

  const copy = (text: string) => {
    writeToClipboard(text).then(
      () => {
        showFor("copied");
      },
      () => {
        showFor("failed");
      },
    );
  };

  return { status, copy };
};
