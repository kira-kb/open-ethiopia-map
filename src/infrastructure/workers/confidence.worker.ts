import { ILocationConfidenceRepository } from "../../domain/entities/location-enrichment-repository.interface";
import { LocationConfidence } from "../../domain/entities/location-confidence.entity";
import { DeliveryCompleted, DeliveryAddressCorrected, DeliveryFailedLocation, DeliveryDriverRequestedHelp } from "../../domain/events";
import { Logger } from "../../domain/interfaces";

export class ConfidenceWorker {
  constructor(
    private readonly confidenceRepo: ILocationConfidenceRepository,
    private readonly logger: Logger,
  ) {}

  async handleDeliveryCompleted(event: DeliveryCompleted): Promise<void> {
    try {
      const coordHash = event.coordHash;
      if (!coordHash) return;

      const existing = await this.confidenceRepo.findByCoordHash(coordHash);
      if (existing) {
        const updated = existing.recordSuccessfulDelivery();

        // Bump successfulFirstAttempt if this is a first-time successful delivery
        const firstAttempt = event.firstAttempt !== false ? updated.recordSuccessfulFirstAttempt() : updated;
        await this.confidenceRepo.save(firstAttempt);
      } else {
        const confidence = new LocationConfidence({
          locationId: event.locationId,
          coordHash,
          successfulDeliveries: 1,
          successfulFirstAttempt: 1,
          confirmationCount: 1,
          confidenceScore: 0.1,
          lastSuccessfulDelivery: new Date(),
          lastConfirmedAt: new Date(),
        });
        await this.confidenceRepo.save(confidence);
      }
      this.logger.info("Confidence updated for successful delivery", { coordHash });
    } catch (err) {
      this.logger.error("Failed to handle DeliveryCompleted", { error: (err as Error).message });
    }
  }

  async handleAddressCorrected(event: DeliveryAddressCorrected): Promise<void> {
    try {
      const coordHash = event.coordHash;
      if (!coordHash) return;

      const existing = await this.confidenceRepo.findByCoordHash(coordHash);
      if (existing) {
        await this.confidenceRepo.save(existing.recordCustomerCorrection());
      }
      this.logger.info("Confidence updated for address correction", { coordHash });
    } catch (err) {
      this.logger.error("Failed to handle DeliveryAddressCorrected", { error: (err as Error).message });
    }
  }

  async handleDeliveryFailedLocation(event: DeliveryFailedLocation): Promise<void> {
    try {
      const coordHash = event.coordHash;
      if (!coordHash) return;

      const existing = await this.confidenceRepo.findByCoordHash(coordHash);
      if (existing) {
        await this.confidenceRepo.save(existing.recordFailedDelivery());
      }
      this.logger.info("Confidence updated for failed delivery", { coordHash, reason: event.reason });
    } catch (err) {
      this.logger.error("Failed to handle DeliveryFailedLocation", { error: (err as Error).message });
    }
  }

  async handleDriverRequestedHelp(event: DeliveryDriverRequestedHelp): Promise<void> {
    try {
      const coordHash = event.coordHash;
      if (!coordHash) return;

      const existing = await this.confidenceRepo.findByCoordHash(coordHash);
      if (existing) {
        await this.confidenceRepo.save(existing.recordDriverHelpRequest());
      }
      this.logger.info("Confidence updated for driver help request", { coordHash });
    } catch (err) {
      this.logger.error("Failed to handle DeliveryDriverRequestedHelp", { error: (err as Error).message });
    }
  }
}

export type DeliveryEvent = DeliveryCompleted | DeliveryAddressCorrected | DeliveryFailedLocation | DeliveryDriverRequestedHelp;
