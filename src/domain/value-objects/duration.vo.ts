export class Duration {
  constructor(
    readonly value: number,
    readonly unit: "s" | "min" | "h",
  ) {
    if (value < 0) throw new Error(`Duration cannot be negative: ${value}`);
  }

  inSeconds(): number {
    switch (this.unit) {
      case "s": return this.value;
      case "min": return this.value * 60;
      case "h": return this.value * 3600;
    }
  }

  inMinutes(): number {
    return this.inSeconds() / 60;
  }

  toText(): string {
    const sec = this.inSeconds();
    if (sec >= 3600) {
      const h = Math.floor(sec / 3600);
      const m = Math.round((sec % 3600) / 60);
      return m > 0 ? `${h}h ${m}min` : `${h}h`;
    }
    if (sec >= 60) return `${Math.round(sec / 60)} min`;
    return `${Math.round(sec)} s`;
  }
}
