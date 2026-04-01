export function setupClientMonitoring() {
  if (typeof window === "undefined") return () => {};

  const onError = (event: ErrorEvent) => {
    console.error("[client-error]", event.message, event.filename, event.lineno, event.colno);
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error("[client-unhandled-rejection]", event.reason);
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
  };
}
