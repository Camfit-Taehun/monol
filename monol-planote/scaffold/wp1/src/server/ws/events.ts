import type { FastifyInstance } from "fastify";
import type { EventBus } from "../../core/events/bus";

export async function registerWsEvents(app: FastifyInstance, bus: EventBus) {
  const sockets = new Set<any>();

  app.get("/api/events", { websocket: true }, (conn) => {
    sockets.add(conn.socket);
    conn.socket.send(JSON.stringify({ type: "hello", payload: {} }));
    conn.socket.on("close", () => sockets.delete(conn.socket));
  });

  bus.on((e) => {
    const msg = JSON.stringify({ type: e.type, payload: e });
    for (const s of sockets) {
      try {
        s.send(msg);
      } catch {
        // ignore
      }
    }
  });
}
