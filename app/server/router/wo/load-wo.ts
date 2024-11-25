import { Prisma } from "@prisma/client";
import { prasiApi } from "lib/server/server-route";

export default prasiApi(
  async (select: any, where: Prisma.t_work_orderWhereInput, arg: any) => {
    const result = await db.t_work_order.findMany({
      select: select,
      orderBy: arg.orderBy || {
        // id: "desc",
        created_at: "desc",
      },
      where,
      ...arg.paging,
    });

    return result;
  }
);
