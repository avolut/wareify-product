import { Prisma } from "@prisma/client";
import { FieldLocal } from "lib/comps/form/typings";
import { FMLocal } from "lib/exports";

export const generateAssetNumber = async (
  fm: FMLocal,
  tableName: Prisma.ModelName,
) => {
  if (tableName === "t_work_order") {
    if (!fm.data.wo_no) {
      const table = db.m_asset;
      const count = await table.count();

      const getDocumentNo = async (count: number): Promise<any> => {
        let docNo = (count + 1).toString().padStart(8, "0");
        const schedule = await table.findFirst({
          where: { codeification: docNo },
        });
        if (schedule) {
          docNo = await getDocumentNo(count++);
        }
        return docNo;
      };
      fm.data.codeification = await getDocumentNo(count);
      fm.render();
    }
  }
};
