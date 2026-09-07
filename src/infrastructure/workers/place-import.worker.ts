import { IWorker } from "./interfaces/worker.interface";
import { DomainEvent, PlaceImported } from "../../domain/events";
import { IPlaceRepository, Logger } from "../../domain/interfaces";

export class PlaceImportWorker implements IWorker {
  readonly name = "place-import";

  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly logger: Logger,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    if (!(event instanceof PlaceImported)) return;

    this.logger.info("Processing place import event", {
      placeId: event.placeId,
      source: event.source,
    });
  }
}
