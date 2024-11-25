import { NotificationType } from "app/notification";
import {
  notificationInitialized,
  notificationReceived,
} from "./notification_recevied";
import { newClientRouter } from "lib/server/server-route";
import { router } from "app/server/router";
import { MonitoringComplaintType, WS_MSG } from "app/server/ws/types";
import { monitoringComplaintItReceived } from "./monitoring_complaint_it_received";

export const client_ws = {
  ws: null as null | WebSocket,
  status: "connecting" as "connecting" | "connected",
  router: newClientRouter(router),
  local: {
    notif: null as null | {
      count: number;
      notifikasi: NotificationType[];
      render: () => void;
    },
    complaint_it: null as null | {
      complaint: MonitoringComplaintType[];
      render: () => void;
    },
  },
  disconnect() {
    client_ws.local.notif = null;
    this.ws?.close();
    this.connect();
  },
  async connect() {
    this.status = "connecting";
    if (isEditor) {
      return;
    }
    const w = window as unknown as {
      user: any;
    };

    if (!w.user?.id) {
      await new Promise<void>((done) => {
        const ival = setInterval(() => {
          if (w.user?.id) {
            clearInterval(ival);
            done();
          }
        }, 1000);
      });
    }

    const user_id = w.user.id;
    const url = baseurl("");
    this.ws = new WebSocket(url);

    const ws = this.ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "identify", user_id }));
    };

    ws.onmessage = (event) => {
      const data: WS_MSG = JSON.parse(event.data);
      if (data.type === "ack") {
        this.status = "connected";
      }
      if (data.type === "notif-new") {
        notificationReceived(data.notif);
      }
      if (data.type === "notif-init") {
        notificationInitialized(data.notif);
      }
      if (data.type === "complaint_it") {
        monitoringComplaintItReceived(data.complaint);
      }
    };

    ws.onclose = (event) => {
      this.connect();
    };
  },
};
