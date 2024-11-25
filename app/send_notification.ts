import { client_ws } from "./lib/ws/client_ws";

export const send_notification = async (
  id: string,
  to: string,
  mode:
    | "request-approval-complaint"
    | "request-approval-work-order"
    | "request-approval-opname"
    | "request-close-complaint-mobile"
    | "request-close-complaint-desktop"
) => {
  const w = window as unknown as {
    user: any;
  };
  let message = null;
  const complaint = await db.t_complaint.findFirst({
    where: {
      id: id,
    },
  });
  const work_order = await db.t_work_order.findFirst({
    where: {
      id: id,
    },
  });
  const opname = await db.t_opname_schedule.findFirst({
    where: {
      id: id,
    },
  });
  const user = await db.m_user.findFirst({
    where: {
      id: w.user.id,
    },
  });
  let name = null;
  let url = null;
  let is_mobile = false;
  switch (mode) {
    case "request-approval-complaint":
      name = "REQUEST APPROVAL COMPLAINT";
      url = `/d/admin/dashboard/approval/complaint#lnk=6972528croot=${complaint?.id}`;
      message = `<b>${user?.name}</b> asks for approval on the complaint <i>"${complaint?.complaint_mesasage}"</i>`;
      break;
    case "request-close-complaint-desktop":
      name = "REQUEST TO CLOSE COMPLAINT";
      url = `/d/complaint#root=${complaint?.id}`;
      message = `<b>${user?.name}</b> asks for close the complaint <i>"${complaint?.complaint_mesasage}"</i>`;
      break;
    case "request-close-complaint-mobile":
      name = "REQUEST TO CLOSE COMPLAINT";
      url = `/m/complaint-mobile#root=${complaint?.id}`;
      message = `<b>${user?.name}</b> asks for close the complaint <i>"${complaint?.complaint_mesasage}"</i>`;
      is_mobile = true;
      break;
    case "request-approval-work-order":
      name = "REQUEST APPROVAL WORK ORDER";
      url = `/d/admin/dashboard/approval/complaint#lnk=6972528croot=${work_order}`;
      message = `<b>${user?.name}</b> asks for approval on the work order <i>"${work_order?.complaint_message}"</i>`;

      break;
    case "request-approval-opname":
      name = "REQUEST APPROVAL OPNAME";
      url = `/d/admin/dashboard/approval/opname#lnk=f5f73208%23root=${opname?.id}`;
      message = `<b>${user?.name}</b> asks for approval on the work order <i>"${opname?.opname_description}"</i>`;
      break;
    default:
      break;
  }
  if (message && to) {
    const notif = await db.m_notification.create({
      data: {
        name: name || "",
        messages: message,
        created_at: new Date(),
        created_by: user?.id || "",
        id_receiver: to,
        url: !!url ? url : "",
        is_mobile: is_mobile,
      },
    });
    client_ws.router.broadcast(user!.id, {
      type: "notif-new",
      notif: notif,
    });
    // notifyUser(user!.id, notif)
  }
};
