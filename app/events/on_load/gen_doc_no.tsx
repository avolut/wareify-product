import { Prisma } from "@prisma/client";
import { FMLocal } from "lib/exports";

export const generateDocumentNumber = async (
  fm: FMLocal,
  tableName: Prisma.ModelName
) => {
  if (tableName === "t_work_order") {
    if (!fm.data.wo_no) {
      const table = db.t_work_order;
      const count = await table.count();

      const getDocumentNo = async (count: number): Promise<any> => {
        let docNo = (count + 1).toString().padStart(8, "0");
        const schedule = await table.findFirst({
          where: { wo_no: docNo },
        });
        if (schedule) {
          docNo = await getDocumentNo(count++);
        }
        return docNo;
      };
      fm.data.wo_no = await getDocumentNo(count);
      fm.render();
    }
  } else if (tableName === "t_preventive_work_order_header") {
    if (!fm.data.pwo) {
      const table = db.t_preventive_work_order_header;
      const count = await table.count();

      const getDocumentNo = async (count: number): Promise<any> => {
        let docNo = (count + 1).toString().padStart(8, "0");
        const schedule = await table.findFirst({
          where: { wo_no: docNo },
        });
        if (schedule) {
          docNo = await getDocumentNo(count++);
        }
        return docNo;
      };
      fm.data.pwo = await getDocumentNo(count);
      fm.render();
    }
  } 
};
