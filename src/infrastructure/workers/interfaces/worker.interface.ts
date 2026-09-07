import { DomainEvent } from "../../../domain/events";

export interface IWorker {
  readonly name: string;
  handle(event: DomainEvent): Promise<void>;
}
