import { Prisma } from "@prisma/client";
import { call_prasi_events } from "lib/exports";
import { prasiApi } from "lib/server/server-route";

export default prasiApi(
  async (select: any, where: Prisma.t_complaintWhereInput, arg: any) => {
    let result: any[] = await db.t_complaint.findMany({
      select: select,
      orderBy: arg.orderBy || {
        // id: "desc",
        complaint_date: "desc",
      },
      where: {
        ...where,
      },
      ...arg.paging,
    });

    return result;
  }
);
