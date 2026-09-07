import { DomainEvent } from "../events";

export type EventHandler = (event: DomainEvent) => Promise<void> | void;

export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}
