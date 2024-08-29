import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { FieldLocal } from "lib/comps/form/typings";
import { FMLocal } from "lib/exports";

export const migrateWorkOrderLoad = async () => {
  const table = db.t_work_order;
  const count = await db.t_work_order.count();
  const getDocumentNo = async (count: number): Promise<any> => {
    let docNo = (count + 1).toString().padStart(8, "0");
    const schedule = await db.t_work_order.findFirst({
      where: { wo_no: docNo },
    });
    if (schedule) {
      docNo = await getDocumentNo(count + 1);
    }
    return docNo;
  };
  const data = await db.m_maintenance_schedule_header.findMany({
    where: { approval_status: "Approved", deleted_at: null },
    include: { m_maintenance_schedule_line: { select: { id: true } } },
  });
  const item = data.map((item: any) => {
    return {
      id: item.id,
      schedule_line: item.m_maintenance_schedule_line,
    };
  });

  const line: string[] = item.reduce((acc: string[], item: any) => {
    if (item.schedule_line) {
      const ids: string[] = item.schedule_line.map((d: any) => d.id);
      acc.push(...ids);
    }
    return acc;
  }, []);

  let date_now = new Date();
  date_now.setUTCHours(0, 0, 0, 0);
  const date = date_now.toISOString();

  console.log({ data });

  const maintenance_task = await db.m_maintenance_schedule_line.findMany({
    where: {
      id: {
        in: line,
      },
      planned_date: date,
      deleted_at: null,
    },
  });
  const maintenance_cost = await db.t_maintenance_schedule_task.findMany({
    where: {
      id_maintenance_schedule_task: {
        in: line,
      },
    },
  });

  const maintenance_group = data.map((item) => item.id_maintenance_group);

  const leader = await db.m_user.findFirst({
    where: {
      m_maintenance_group_user: {
        some: {
          m_maintenance_group_role: {
            m_maintenance_group: {
              id: maintenance_group[0] || "",
            },
            m_role: { name: "Maintenance Leader" },
          },
        },
      },
    },
    // select: { id: true },
  });
  console.log({ maintenance_group });
  const task = maintenance_task.find((item) => item.id_asset);
  const id_asset = task?.id_asset;
  console.log(task);
  if (id_asset) {
    const wo = await db._batch.upsert({
      table: "t_work_order",
      // @ts-ignore
      where: {
        id_asset: id_asset,
        id_maintenance_schedule: task?.id_m_maintenance_schedule,
      },
      data: [
        {
          name: task?.notes,
          id_client: task?.id_client || "",
          status: "Approved",
          planned_date: task?.planned_date,
          due_date: task?.due_date,
          id_maintenance_group: maintenance_group[0],
          notes: task?.notes,
          id_asset: task?.id_asset,
          wo_no: await getDocumentNo(count),
          id_maintenance_leader: leader?.id,
          id_maintenance_schedule: task?.id,
        },
      ],
    });
  }
};
