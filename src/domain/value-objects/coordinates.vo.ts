export class Coordinates {
  constructor(
    readonly latitude: number,
    readonly longitude: number,
  ) {
    if (latitude < -90 || latitude > 90) {
      throw new Error(`Invalid latitude: ${latitude}`);
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error(`Invalid longitude: ${longitude}`);
    }
  }

  toKey(): string {
    return `${this.latitude.toFixed(6)},${this.longitude.toFixed(6)}`;
  }

  distanceTo(other: Coordinates): number {
    const R = 6371000;
    const dLat = this.toRad(other.latitude - this.latitude);
    const dLng = this.toRad(other.longitude - this.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this.latitude)) *
        Math.cos(this.toRad(other.latitude)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
