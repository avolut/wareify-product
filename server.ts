import { autoCloseStatus } from "app/server/auto_close";
import type {} from "./typings/global";
import { server_ws } from "app/server/server-ws";
import { useServerRouter } from "lib/server/server-route";
import { router } from "app/server/router";
import { serverWSIdentity } from "app/server/ws/identity";

const server_router = useServerRouter(router);

export const server: PrasiServer = {
  async init(arg) {
    autoCloseStatus();
  },
  ws: {
    open(ws) {},
    message(ws, message) {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "identify" && data.user_id) {
          serverWSIdentity(ws, data);
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    },
    close(ws, code, reason) {
      server_ws.unsubscribe(ws);
    },
  },
  async http(arg) {
    return await server_router.handle(arg);
  },
};
