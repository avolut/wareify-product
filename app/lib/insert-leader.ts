export const insertLeader = async (
  data: any,
  idMaintenanceLeader: string
): Promise<any> => {
  try {
    const wo = await db.t_work_order.create({
      data: {
        ...data,
      },
    });
    await db.t_work_order.update({
      where: {
        id: wo.id
      },
      data: {
        id_maintenance_leader: idMaintenanceLeader
      }
    });
    return wo;
  } catch (e: any) {
    throw new Error(e);
  }
};
