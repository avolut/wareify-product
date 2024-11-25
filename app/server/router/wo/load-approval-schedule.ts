import { Prisma } from "@prisma/client";
import { prasiApi } from "lib/server/server-route";

export default prasiApi(
  async (
    select: any,
    where: Prisma.m_maintenance_schedule_headerWhereInput,
    arg: any
  ) => {
    const result = await db.m_maintenance_schedule_header.findMany({
      select: select,
      orderBy: arg.orderBy || {
        id: "desc",
      },
      where: {
        ...where,
      },
      ...arg.paging,
    });

    return result;
  }
);
