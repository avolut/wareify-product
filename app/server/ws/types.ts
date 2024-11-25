import { NotificationType } from "app/notification";

export type WS_MSG =
  | { type: "ack" }
  | { type: "notif-init"; notif: NotificationType[] }
  | { type: "notif-new"; notif: NotificationType }
  | { type: "complaint_it"; complaint: MonitoringComplaintType };

export type MonitoringComplaintType = {
  id: string;
  complaint_mesasage: string;
  complaint_date: string;
  complaint_attachment: string;
  complaint_priority: string;
  m_asset: { id: string; name: string };
  m_maintenance_group: {
    id: string;
    name: string;
  };
  status: string;
  complaint_no: string;
  requested_by: { id: string; name: string };
  m_location: { id: string; name: string };
  staff_maintenance: {
    id: string;
    name: string;
  };
};
