import { get_user } from "lib/utils/get_user";

export const update_status_task = async (id: string) => {
  const header = await db.t_preventive_work_order_header.findFirst({
    where: {
      id: id,
    },
  });

  const line = await db.t_preventive_work_order_line.count({
    where: {
      id_preventive_work_order_header: id,
    },
  });
  let status = null;
  if (line > 0) {
    status = "On Progress";
    const done = await db.t_preventive_work_order_line.count({
      where: {
        id_preventive_work_order_header: id,
        status: "Done",
      },
    });
    const progress = await db.t_preventive_work_order_line.count({
      where: {
        id_preventive_work_order_header: id,
        status: "On Progress",
      },
    });
    if (done === line) {
      status = "Waiting Closed";
    } else if (progress > 0) {
      status = "On Progress";
    }
    let update = null as any;
    if (header && header.status) {
      if (header.status === "On Progress" && status === "Waiting Closed") {
        update = {
          status,
          actual_date: new Date(),
          updated_at: new Date(),
          updated_by: get_user("id"),
        };
      } else if (
        ["Not Started", "Open"].includes(header.status) &&
        status === "On Progress"
      ) {
        update = {
          status,
          updated_at: new Date(),
          updated_by: get_user("id"),
        };
      }else {
        update = {
          status,
          updated_at: new Date(),
          updated_by: get_user("id"),
        };
      }
      if (update) {
        await db.t_preventive_work_order_header.update({
          where: {
            id: id,
          },
          data: update,
        });
      }
    }
  }
};
