import { m_maintenance_schedule } from "@prisma/client";
import { warnOnce } from "@prisma/client/runtime/library";

export const insertWo = async (
  schedule: m_maintenance_schedule,
  idMaintenanceLeader: string
): Promise<any> => {

  try {
    const wo = await db.t_work_order.create({
      data: {
        id_client: schedule.id_client,
        name: schedule.name,
        notes: schedule.notes,
        id_maintenance_group: schedule.id_maintenance_group,
        date: schedule.start_date,
        attachment: schedule.attachment,
        planned_date: schedule.start_date,
        due_date: schedule.end_date,
        status: schedule.approval_status,
        id_maintenance_schedule: schedule.id,
      },
    });
    return wo;
  } catch (e: any) {
    throw new Error(e);
  }
};
