import { get_user } from "lib/utils/get_user";
import { repetitive_date } from "./repetitive_date";
import { createMany } from "drizzle-orm";
import { formatDay } from "lib/utils/date";

export const gen_asset_schedule = async (id_maintenance: string) => {
  const maintenance = await db.m_maintenance_schedule_header.findFirst({
    where: {
      id: id_maintenance,
    },
    include: {
      m_maintenance_schedule_line: {
        where: {
          deleted_at: null,
        },
        include: {
          m_asset: true,
        },
      },
    },
  });
  if (
    maintenance &&
    maintenance?.start_date &&
    maintenance?.end_date &&
    maintenance?.repeat
  ) {
    const startDate = new Date(maintenance?.start_date);
    startDate.setHours(8, 0, 0, 0); // Set time to 08:00:00
    const endDate = new Date(maintenance?.end_date);
    endDate.setHours(23, 59, 59, 999);
    const preventive = repetitive_date(
      startDate,
      endDate,
      maintenance?.repeat_every,
      maintenance?.repeat as any,
      {
        weeks: maintenance.weeks?.split(","),
        onDay: maintenance.on_day,
        onMonth: maintenance.on_month,
      }
    );
    const data = [] as any[];

    const count = await db.t_preventive_work_order_header.count();
    let n = count;
    maintenance.m_maintenance_schedule_line.map((e) => {
      preventive.map((i) => {
        data.push({
          id_asset: e.id_asset,
          preventive_date: i,
          status: isToday(i) ? "Open" : "Not Started",
          id_category: e.m_asset?.id_category,
          id_location: e.m_asset?.id_location,
          created_at: new Date(),
          created_by: get_user("id"),
          id_client: get_user("id_client"),
          assign_user: e.id_staff,
          id_maintenance_group: maintenance?.id_maintenance_group,
          id_schedule_header_line: e.id,
          pwo: `PWO/${formatDay(new Date(), "MM-YYYY")}/${(n + 1)
            .toString()
            .padStart(8, "0")}`,
        });
        n++;
      });
    });
    const res = await db._batch.upsert({
      table: "t_preventive_work_order_header",
      where: {
        id_schedule_header_line: {
          in: maintenance.m_maintenance_schedule_line.map(
            (e: { id: any }) => e.id
          ),
        },
      },
      data: data,
      mode: "relation",
    });
    if (res.length) {
      const header = await db.t_preventive_work_order_header.findMany({
        where: {
          id: {
            in: res.map((e: any) => e.id),
          },
          m_maintenance_schedule_line: {
            m_form: {
              some: {},
            },
          },
        },
        include: {
          m_maintenance_schedule_line: {
            include: {
              m_form: true,
            },
          },
        },
      });

      const line = [] as any[];
      if (header.length) {
        header.map((e: any) => {
          const header_line = e.m_maintenance_schedule_line.m_form || [];
          header_line.map((ln: any) => {
            line.push({
              created_at: new Date(),
              id_user: ln.id_user,
              name: ln.name,
              type: ln.type,
              status: "Not Started",
              id_client: get_user("id_client"),
              created_by: get_user("id"),
              id_preventive_work_order_header: e.id,
            });
          });
        });
      }
      if (line.length) {
        await db.t_preventive_work_order_line.createMany({
          data: line,
        });
      }
    }
  }
};
function isToday(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
