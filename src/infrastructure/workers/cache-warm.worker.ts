import { IWorker } from "./interfaces/worker.interface";
import { DomainEvent, SearchPerformed } from "../../domain/events";
import { ICache, Logger } from "../../domain/interfaces";

export class CacheWarmWorker implements IWorker {
  readonly name = "cache-warm";

  constructor(
    private readonly cache: ICache,
    private readonly logger: Logger,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    if (!(event instanceof SearchPerformed)) return;

    if (event.provider !== "photon") return;

    this.logger.debug("Cache warm: frequent photon query", {
      query: event.query,
      responseTimeMs: event.responseTimeMs,
    });
  }
}
