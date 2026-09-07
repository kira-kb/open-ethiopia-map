import { Logger } from "../../domain/interfaces";

export class StructuredLogger implements Logger {
  constructor(
    private readonly context: string,
    private readonly level: string = "info",
  ) {}

  private log(level: string, message: string, meta?: Record<string, unknown>): void {
    if (this.shouldSkip(level)) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...(meta || {}),
    };

    switch (level) {
      case "error":
        console.error(JSON.stringify(entry));
        break;
      case "warn":
        console.warn(JSON.stringify(entry));
        break;
      default:
        console.log(JSON.stringify(entry));
    }
  }

  private shouldSkip(level: string): boolean {
    const levels = ["debug", "info", "warn", "error"];
    return levels.indexOf(level) < levels.indexOf(this.level);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log("warn", message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log("error", message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log("debug", message, meta);
  }
}
