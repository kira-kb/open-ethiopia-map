import { IEventBus, EventHandler } from "../../domain/interfaces";
import { DomainEvent } from "../../domain/events";
import { Logger } from "../../domain/interfaces";

export class InMemoryEventBus implements IEventBus {
  private subscribers = new Map<string, Set<EventHandler>>();

  constructor(private readonly logger: Logger) {}

  async publish(event: DomainEvent): Promise<void> {
    const eventType = event.constructor.name;
    const handlers = this.subscribers.get(eventType);
    if (!handlers?.size) return;

    const promises: Promise<void>[] = [];
    for (const handler of handlers) {
      try {
        const result = handler(event);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (err) {
        this.logger.error("Event handler failed", {
          eventType,
          error: (err as Error).message,
        });
      }
    }

    await Promise.allSettled(promises);
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);
    this.logger.debug(`Subscribed to ${eventType}`);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    this.subscribers.get(eventType)?.delete(handler);
  }
}
