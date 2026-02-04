import { EventEmitter } from "node:events";

export type EventPayload =
  | { type: "index:updated" }
  | { type: "index:error"; message: string }
  | { type: "annotation:changed" }
  | { type: "cycle:changed" }
  | { type: "bundle:changed" }
  | { type: "revision:changed" };

export class EventBus {
  private ee = new EventEmitter();

  on(handler: (e: EventPayload) => void) {
    this.ee.on("event", handler);
    return () => this.ee.off("event", handler);
  }

  emit(e: EventPayload) {
    this.ee.emit("event", e);
  }
}
