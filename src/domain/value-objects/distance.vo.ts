export class Distance {
  constructor(
    readonly value: number,
    readonly unit: "m" | "km",
  ) {
    if (value < 0) throw new Error(`Distance cannot be negative: ${value}`);
  }

  inMeters(): number {
    return this.unit === "km" ? this.value * 1000 : this.value;
  }

  inKilometers(): number {
    return this.unit === "m" ? this.value / 1000 : this.value;
  }

  toText(): string {
    const km = this.inKilometers();
    if (km >= 1) return `${km.toFixed(1)} km`;
    return `${Math.round(this.inMeters())} m`;
  }
}
