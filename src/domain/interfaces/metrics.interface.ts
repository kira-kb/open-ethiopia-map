export interface IMetricsRegistry {
  incrementCounter(name: string, labels?: Record<string, string>, value?: number): void;
  observeHistogram(name: string, value: number, labels?: Record<string, string>): void;
  setGauge(name: string, value: number, labels?: Record<string, string>): void;
  timing<T>(name: string, fn: () => Promise<T>, labels?: Record<string, string>): Promise<T>;
}
