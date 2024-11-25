import { ServerWebSocket } from "bun";
import { server_ws } from "../server-ws";
import { NotificationType } from "app/notification";

export const serverWSIdentity = (
  ws: ServerWebSocket<{
    url: string;
  }>,
  data: { user_id: string }
) => {
  const user_id = data.user_id;
  server_ws.subscribe(ws, { user_id });
  ws.send(
    JSON.stringify({
      type: "ack",
    })
  );
  db.m_notification
    .findMany({
      where: {
        id_receiver: user_id,
      },
    })
    .then((e: NotificationType[]) => {
      ws.send(JSON.stringify({ type: "notif-init", notif: e }));
    })
    .catch((err: any) => {
      console.error(err);
    });

  // // jika butuh dikirim notifikasi,
  // ws.send(JSON.stringify({ type: "notif-init", notif: null }));
};
