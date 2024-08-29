import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { FieldLocal } from "lib/comps/form/typings";
import { FMLocal } from "lib/exports";

export const migrateWorkOrder = async (fm: FMLocal, data: any) => {
  const table = db.t_work_order;
  const count = await table.count();
  const getDocumentNo = async (count: number): Promise<any> => {
    let docNo = (count + 1).toString().padStart(8, "0");
    const schedule = await table.findFirst({
      where: { wo_no: docNo },
    });
    if (schedule) {
      docNo = await getDocumentNo(count + 1);
    }
    return docNo;
  };
  fm.data.wo_no = await getDocumentNo(count);

  const maintenance_task = await db.m_maintenance_schedule_line.findMany({
    where: {
      id: {
        in: data.m_maintenance_schedule_line.map((item: any) => item.id),
      },
      deleted_at: null
    },
  });
  const maintenance_cost = await db.t_maintenance_schedule_task.findMany({
    where: {
      id_maintenance_schedule_task: {
        in: data.m_maintenance_schedule_line.map((item: any) => item.id),
      },
    },
  });
  const input_date = dayjs(data.start_date).format("DD-MM-YYYY");
  const date_now = dayjs().format("DD-MM-YYYY");
  const leader = await db.m_user.findFirst({
    where: {
      m_maintenance_group_user: {
        some: {
          m_maintenance_group_role: {
            m_maintenance_group: {
              id: data.m_maintenance_group.connect.id,
            },
            m_role: { name: "Maintenance Leader" },
          },
        },
      },
    },
    select: { id: true },
  });
  if (input_date === date_now && data.approval_status === "Approved") {
    maintenance_task.map(async (item) => {
      const wo = await db.t_work_order.create({
        data: {
          name: data.name,
          id_client: data.id_client,
          status: data.approval_status,
          planned_date: item?.planned_date,
          due_date: item?.due_date,
          id_maintenance_group: data.m_maintenance_group.connect.id,
          notes: item?.notes,
          id_asset: item?.id_asset,
          wo_no: await getDocumentNo(count),
          id_maintenance_leader: leader?.id,
          id_maintenance_schedule: data.id,
        },
      });
      if (wo && wo.id && maintenance_cost) {
        maintenance_cost.map(async (item) => {
          await db.t_maintenance_task.create({
            data: {
              id_client: data.id_client,
              task_description: item?.task_description,
              planned_date: item?.planned_date,
              due_date: item?.due_date,
              // id_staff: maintenance_cost?.id_staff,
              id_wo: wo.id,
            },
          });
        });
      }
    });

    // await db.t_maintenance_task_line.create({
    //   data: {
    //     id_client: data.id_client,
    //     type: maintenance_cost?.type,
    //     description: maintenance_cost?.description,
    //     quantity: maintenance_cost?.quantity,
    //     price: maintenance_cost?.price,
    //     notes: maintenance_cost?.notes,
    //   },
    // });
  }
};
