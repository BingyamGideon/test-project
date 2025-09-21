// Suppress noisy ResizeObserver console errors that originate from layout libraries
// Context: Chrome may emit "ResizeObserver loop limit exceeded" or
// "ResizeObserver loop completed with undelivered notifications" even when harmless.
// We prevent these from bubbling to the console to avoid user confusion.

if (typeof window !== "undefined") {
  const swallow = (message: unknown) => {
    const msg = typeof message === "string" ? message : String(message ?? "");
    return (
      msg.includes("ResizeObserver loop limit exceeded") ||
      msg.includes("ResizeObserver loop completed with undelivered notifications")
    );
  };

  const onError = (e: ErrorEvent) => {
    if (e?.message && swallow(e.message)) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  };

  const onRejection = (e: PromiseRejectionEvent) => {
    const reason = (e?.reason && (e.reason.message || String(e.reason))) || "";
    if (typeof reason === "string" && swallow(reason)) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  };

  // Filter console noise if browsers log it as warnings/errors without throwing
  const patchConsole = () => {
    const methods: Array<keyof Console> = ["error", "warn"];
    methods.forEach((m) => {
      const original = console[m] as (...args: any[]) => void;
      if ((original as any).__patchedResizeObserver) return;
      const patched = (...args: any[]) => {
        try {
          const text = args.map((a) => (typeof a === "string" ? a : (a?.message ?? ""))).join(" ");
          if (swallow(text)) return;
        } catch {}
        return original.apply(console, args as any);
      };
      (patched as any).__patchedResizeObserver = true;
      console[m] = patched as any;
    });
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  patchConsole();
}
