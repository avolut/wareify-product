import { ServerWebSocket } from "bun";
import { WS_MSG } from "./ws/types";

type USER_ID = string;
export const subscriber = {} as Record<
  USER_ID,
  {
    notif: {
      total: number;
    };
    all_ws: Set<ServerWebSocket<{ url: string }>>;
  }
>;

export const ws_subscriber = new Map<
  ServerWebSocket<{ url: string }>,
  USER_ID
>();

export const server_ws = {
  send(ws: ServerWebSocket<{ url: string }>, data: WS_MSG) {},
  broadcast(user_id: string, data: WS_MSG) {
    subscriber[user_id]?.all_ws.forEach((ws) => {
      ws.send(JSON.stringify(data));
    });
  },
  subscribe: (
    ws: ServerWebSocket<{ url: string }>,
    data: { user_id: string }
  ) => {
    ws_subscriber.set(ws, data.user_id);
    let user = subscriber[data.user_id];
    if (!user) {
      subscriber[data.user_id] = { notif: { total: 0 }, all_ws: new Set() };
      user = subscriber[data.user_id];
    }

    if (user) {
      user.all_ws.add(ws);
    }
  },
  unsubscribe: (ws: ServerWebSocket<{ url: string }>) => {
    const user_id = ws_subscriber.get(ws);
    if (user_id && subscriber[user_id]) {
      subscriber[user_id].all_ws.delete(ws);
    }
    ws_subscriber.delete(ws);
  },
};
