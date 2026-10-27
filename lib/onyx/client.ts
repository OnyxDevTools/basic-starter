import "server-only";
import { onyx } from "@onyx.dev/onyx-database";

// Lazy construction: builds and unrelated pages do not need credentials.
// Keep the package external in Next so the official config resolver can run.
export function createDatabase() {
  return onyx.init<{ Task: Task }>({
    wireFormat: "json",
    requestLoggingEnabled: false,
    responseLoggingEnabled: false,
    retry: { enabled: false },
    fetch: async (input, init) =>
      fetch(input, {
        ...init,
        body:
          init?.body instanceof Uint8Array
            ? new Uint8Array(init.body).buffer
            : (init?.body ?? null),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }),
  });
}

export type Task = { id: string; title: string; completed: boolean };
