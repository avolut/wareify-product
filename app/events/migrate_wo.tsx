import dayjs from "dayjs";
import { FieldLocal } from "lib/comps/form/typings";
import { FMLocal } from "lib/exports";

export const migrateWorkOrder = async (fm: FMLocal, data: any ) => {
    const maintenance_task = await db.m_maintenance_schedule_task.findFirst({
        where: {
          id: {
            in: data.m_maintenance_schedule_task.map((item: any) => item.id),
          },
        },
        include: {
          m_maintenance_schedule_cost: {
            select: {
              id: true,
            },
          },
        },
      });
      const maintenance_cost = await db.m_maintenance_schedule_cost.findFirst({
        where: {
          id: {
            in: maintenance_task?.m_maintenance_schedule_cost.map(
              (item: any) => item.id
            ),
          },
        },
      });
    const input_date = dayjs(data.start_date).format("DD-MM-YYYY");
  const date_now = dayjs().format("DD-MM-YYYY");
    if (input_date === date_now && data.approval_status === "Approved") {
        await db._batch.upsert({
          where: { id: data.id_maintenance_schedule },
          table: "t_work_order",
          data: [
            {
              name: data.name,
              id_client: data.id_client,
              status: data.approval_status,
              planned_date: data.start_date,
              due_date: data.end_date,
              attachment: data.attachment,
              id_spv: data.id_spv_assign,
              id_maintenance_group: data.id_maintenance_group,
              notes: data.notes,
            },
          ],
        });
        await db.t_maintenance_task.create({
          data: {
            id_client: data.id_client,
            task_description: maintenance_task?.notes,
            planned_date: maintenance_task?.planned_date,
            due_date: maintenance_task?.due_date,
            id_staff: maintenance_task?.id_staff,
          },
        });
        await db.t_maintenance_task_line.create({
          data: {
            id_client: data.id_client,
            type: maintenance_cost?.type,
            description: maintenance_cost?.description,
            quantity: maintenance_cost?.quantity,
            price: maintenance_cost?.price,
            notes: maintenance_cost?.notes,
          },
        });
      }
    }
