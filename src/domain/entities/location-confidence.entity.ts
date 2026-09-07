export enum ConfidenceLevel {
  VERY_LOW = "VERY_LOW",
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  VERY_HIGH = "VERY_HIGH",
}

function computeLevel(score: number): ConfidenceLevel {
  if (score >= 0.9) return ConfidenceLevel.VERY_HIGH;
  if (score >= 0.7) return ConfidenceLevel.HIGH;
  if (score >= 0.4) return ConfidenceLevel.MEDIUM;
  if (score >= 0.15) return ConfidenceLevel.LOW;
  return ConfidenceLevel.VERY_LOW;
}

export interface LocationConfidenceConstructor {
  id?: string;
  locationId?: string;
  coordHash: string;
  successfulDeliveries?: number;
  failedDeliveries?: number;
  driverCorrections?: number;
  driverHelpRequests?: number;
  successfulFirstAttempt?: number;
  customerCorrections?: number;
  confirmationCount?: number;
  editCount?: number;
  confidenceScore?: number;
  confidenceLevel?: ConfidenceLevel;
  lastSuccessfulDelivery?: Date;
  lastConfirmedAt?: Date;
  lastUpdatedAt?: Date;
  createdAt?: Date;
}

export class LocationConfidence {
  readonly id: string;
  readonly locationId?: string;
  readonly coordHash: string;
  readonly successfulDeliveries: number;
  readonly failedDeliveries: number;
  readonly driverCorrections: number;
  readonly driverHelpRequests: number;
  readonly successfulFirstAttempt: number;
  readonly customerCorrections: number;
  readonly confirmationCount: number;
  readonly editCount: number;
  readonly confidenceScore: number;
  readonly confidenceLevel: ConfidenceLevel;
  readonly lastSuccessfulDelivery?: Date;
  readonly lastConfirmedAt?: Date;
  readonly lastUpdatedAt: Date;
  readonly createdAt: Date;

  constructor(props: LocationConfidenceConstructor) {
    this.id = props.id || "";
    this.locationId = props.locationId;
    this.coordHash = props.coordHash;
    this.successfulDeliveries = props.successfulDeliveries || 0;
    this.failedDeliveries = props.failedDeliveries || 0;
    this.driverCorrections = props.driverCorrections || 0;
    this.driverHelpRequests = props.driverHelpRequests || 0;
    this.successfulFirstAttempt = props.successfulFirstAttempt || 0;
    this.customerCorrections = props.customerCorrections || 0;
    this.confirmationCount = props.confirmationCount || 0;
    this.editCount = props.editCount || 0;
    this.confidenceScore = props.confidenceScore ?? 0;
    this.confidenceLevel = props.confidenceLevel || computeLevel(this.confidenceScore);
    this.lastSuccessfulDelivery = props.lastSuccessfulDelivery;
    this.lastConfirmedAt = props.lastConfirmedAt;
    this.lastUpdatedAt = props.lastUpdatedAt || new Date();
    this.createdAt = props.createdAt || new Date();
  }

  private recalc(): LocationConfidence {
    const score = Math.max(0, Math.min(1, this.confidenceScore));
    return new LocationConfidence({
      ...this,
      confidenceScore: score,
      confidenceLevel: computeLevel(score),
      lastUpdatedAt: new Date(),
    });
  }

  recordSuccessfulDelivery(): LocationConfidence {
    return new LocationConfidence({
      ...this,
      successfulDeliveries: this.successfulDeliveries + 1,
      confirmationCount: this.confirmationCount + 1,
      confidenceScore: Math.min(1, this.confidenceScore + 0.1),
      lastSuccessfulDelivery: new Date(),
      lastConfirmedAt: new Date(),
    }).recalc();
  }

  recordFailedDelivery(): LocationConfidence {
    return new LocationConfidence({
      ...this,
      failedDeliveries: this.failedDeliveries + 1,
      confidenceScore: Math.max(0, this.confidenceScore - 0.15),
    }).recalc();
  }

  recordDriverCorrection(): LocationConfidence {
    return new LocationConfidence({
      ...this,
      driverCorrections: this.driverCorrections + 1,
      editCount: this.editCount + 1,
      confidenceScore: Math.max(0, this.confidenceScore - 0.1),
    }).recalc();
  }

  recordDriverHelpRequest(): LocationConfidence {
    return new LocationConfidence({
      ...this,
      driverHelpRequests: this.driverHelpRequests + 1,
      confidenceScore: Math.max(0, this.confidenceScore - 0.08),
    }).recalc();
  }

  recordSuccessfulFirstAttempt(): LocationConfidence {
    return new LocationConfidence({
      ...this,
      successfulFirstAttempt: this.successfulFirstAttempt + 1,
      confidenceScore: Math.min(1, this.confidenceScore + 0.05),
    }).recalc();
  }

  recordCustomerCorrection(): LocationConfidence {
    return new LocationConfidence({
      ...this,
      customerCorrections: this.customerCorrections + 1,
      editCount: this.editCount + 1,
      confidenceScore: Math.max(0, this.confidenceScore - 0.05),
    }).recalc();
  }
}
