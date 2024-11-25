import { NotificationType } from "app/notification";
import { client_ws } from "./client_ws";

export const notificationReceived = async (notif: NotificationType) => {
  if (!client_ws.local.notif) {
    await new Promise<void>((done) => {
      const ival = setInterval(() => {
        if (client_ws.local.notif) {
          clearInterval(ival);
          done();
        }
      }, 500);
    });
  }

  if (client_ws.local.notif) {
    client_ws.local.notif.notifikasi.push(notif);
    client_ws.local.notif.count = client_ws.local.notif.count++;
    client_ws.local.notif.render();
  }
};

export const notificationInitialized = async (notif: NotificationType[]) => {
  if (!client_ws.local.notif) {
    await new Promise<void>((done) => {
      const ival = setInterval(() => {
        if (client_ws.local.notif) {
          clearInterval(ival);
          done();
        }
      }, 500);
    });
  }
  if (client_ws.local.notif) {
    client_ws.local.notif.notifikasi = notif;
    client_ws.local.notif.count = notif.length;
    client_ws.local.notif.render();
  }
};
