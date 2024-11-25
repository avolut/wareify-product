import { NotificationType } from "app/notification";

export const clients = new Map<string, any>();

type MonitoringComplaintType = {
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

export const summonWebSocket = (local: any, user_id: string) => {
  const url = baseurl("");
  const ws = new WebSocket(url);
  console.log("clients from summonWebSocket", clients);

  ws.onopen = () => {
    console.log("user_id from ws on open", user_id);
    ws.send(JSON.stringify({ type: "identify", user_id }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "notification") {
      const newNotif: NotificationType = {
        id: data.id,
        name: data.name,
        url: data.url,
        read_at: null,
        id_complaint: data.id_complaint,
        id_receiver: data.id_receiver,
        is_mobile: data.is_mobile,
        messages: data.messages,
        created_at: data.created_at,
        created_by: data.created_by,
        deleted_at: data.deleted_at,
      };
      local.notifikasi.push(newNotif);
      local.render();
    }
    if (data.type === "monitoring_complaint_building") {
      const newData: MonitoringComplaintType = data;
      local.result.push(newData);
      local.render();
    }
  };
  return () => {
    if (ws.readyState === 1) {
      ws.close();
    }
  };
};

export const sendMonitoringComplaintBuilding = (
  user_id: string,
  message: any
) => {
  const ws = clients.get(user_id);
  console.log("user_id from send monitoring", user_id);
  console.log("Ini client ws ya bang", clients);
  if (ws) {
    console.log("WS muantap pol ini bang");
    ws.send(JSON.stringify({ type: "monitoring_complaint_building", message }));
  }
};
