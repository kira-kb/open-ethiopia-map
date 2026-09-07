export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeoutMs: number;
  name: string;
}

enum State {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

export class CircuitBreaker {
  private state: State = State.CLOSED;
  private failures = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  readonly name: string;

  constructor(opts: CircuitBreakerOptions) {
    this.failureThreshold = opts.failureThreshold;
    this.resetTimeoutMs = opts.resetTimeoutMs;
    this.name = opts.name;
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === State.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.resetTimeoutMs) {
        this.state = State.HALF_OPEN;
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = State.CLOSED;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = State.OPEN;
    }
  }

  getState(): State {
    return this.state;
  }

  isOpen(): boolean {
    return this.state === State.OPEN;
  }
}
