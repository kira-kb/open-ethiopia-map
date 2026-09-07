import { IMetricsRegistry } from "../../domain/interfaces";

export class NoopMetricsRegistry implements IMetricsRegistry {
  incrementCounter(_name: string, _labels?: Record<string, string>, _value?: number): void {}
  observeHistogram(_name: string, _value: number, _labels?: Record<string, string>): void {}
  setGauge(_name: string, _value: number, _labels?: Record<string, string>): void {}
  async timing<T>(_name: string, fn: () => Promise<T>, _labels?: Record<string, string>): Promise<T> {
    return fn();
  }
}
