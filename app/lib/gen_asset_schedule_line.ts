import { get_user } from "lib/utils/get_user";

export const gen_asset_schedule_line = async (id_maintenance: string) => {
  const maintenance = await db.m_maintenance_schedule_header.findFirst({
    where: {
      id: id_maintenance,
    },
  });
  let where = {} as any;
  if (maintenance?.id_maintenance_group)
    where = {
      ...where,
      id_maintenance_group: maintenance?.id_maintenance_group,
    };
  const asset = await db.m_asset.findMany({
    where: where,
  });

  const data = asset.length
    ? asset.map((e) => {
        return {
          id_m_maintenance_schedule: id_maintenance,
          id_asset: e.id,
          planned_date: maintenance?.start_date,
          due_date: maintenance?.end_date,
          created_at: new Date(),
          created_by: get_user("id"),
        };
      })
    : [];
  await db._batch.upsert({
    table: "m_maintenance_schedule_line",
    where: {
      id_m_maintenance_schedule: id_maintenance,
      // id_asset: {
      //   in: asset.map((e) => e.id),
      // },
    },
    data,
    mode: "relation",
  });
};
