import { Prisma } from "@prisma/client";
import { FMLocal } from "lib/exports";

export const generateDocumentNumber = async (
  fm: FMLocal,
  tableName: Prisma.ModelName,
  where?: any
) => {
  if (!fm.data.document_no) {
    const table = (db as any)[tableName];
    const count = await table.count();
    const getDocumentNo = async (count: number): Promise<any> => {
      let docNo = (count + 1).toString().padStart(8, "0");
      const schedule = await table.findFirst({
        where: { where },
      });
      if (schedule) {
        docNo = await getDocumentNo(count++);
      }
      return docNo;
    };

    fm.data[where] = await getDocumentNo(count);
  }
};
