import { MonitoringComplaintType } from "app/server/ws/types";
import { client_ws } from "./client_ws";

export const monitoringComplaintItReceived = async (
  complaint: MonitoringComplaintType
) => {
  if (!client_ws.local.complaint_it) {
    await new Promise<void>((done) => {
      const ival = setInterval(() => {
        if (client_ws.local.complaint_it) {
          clearInterval(ival);
          done();
        }
      }, 500);
    });
  }

  if (client_ws.local.complaint_it) {
    client_ws.local.complaint_it.complaint.push(complaint);
    client_ws.local.complaint_it.render();
  }
};
