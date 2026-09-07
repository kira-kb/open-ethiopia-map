export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  backoff: "exponential" | "linear" | "fixed";
  maxDelayMs?: number;
}

export async function retry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions,
): Promise<T> {
  let lastError: Error | undefined;
  let delay = opts.initialDelayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (attempt === opts.maxAttempts) break;

      await sleep(delay);

      switch (opts.backoff) {
        case "exponential":
          delay = Math.min(delay * 2, opts.maxDelayMs || 30000);
          break;
        case "linear":
          delay += opts.initialDelayMs;
          break;
        case "fixed":
          break;
      }
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
