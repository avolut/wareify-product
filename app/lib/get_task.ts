import { get_user } from "lib/exports";

export const get_task = async (id: string) => {
  const asset = await db.m_asset.findFirst({
    where: {
      id,
    },
  });
  const task = await db.m_task.findMany({
    where: {
      id_category: asset.id_category,
    },
  });
  return task.length
    ? task.map((e: { name: any; type: any }) => {
        return {
          name: e.name,
          type: e.type,
          id_client: get_user("id_client"),
          created_at: new Date(),
          created_by: get_user("id"),
        };
      })
    : [];
};
