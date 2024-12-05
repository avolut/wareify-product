import dayjs from "dayjs";
import { FieldLocal } from "lib/comps/form/typings";
import { FMLocal } from "lib/exports";

export const changeStatusWO = async (fm: FMLocal, data: any) => {
  const input_date = dayjs(data.start_date).format("DD-MM-YYYY");
  const statusTask = await db.t_maintenance_task.findUnique({
    where: {id: "acf10d86-290d-45c3-8651-231a569ab87a" }
  })
  return
//   if (statusTask === "Completed") {
//     await db._batch.upsert({
//       where: { id: data.id_maintenance_schedule },
//       table: "t_work_order",
//       data: [
//         {
//           name: data.name,
//           id_client: data.id_client,
//           status: data.approval_status,
//           planned_date: data.start_date,
//           due_date: data.end_date,
//           attachment: data.attachment,
//           id_spv: data.id_spv_assign,
//           id_maintenance_group: data.id_maintenance_group,
//           notes: data.notes,
//         },
//       ],
//     });
//   }
};
