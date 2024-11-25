import { getRunningNumber } from "./get-running-number";

export const gen_codeification = async (id_asset: string) => {
  const asset = await db.m_asset.findFirst({
    where: {
      id: id_asset,
    },
    include: {
      m_maintenance_group: true,
      m_category: true,
    },
  });
  if(asset && !asset?.codeification){
    let codeification = "";
      const manufacture_year = asset?.manufacture_year;
      const count = await db.m_asset.count();
      const getDocumentNo = async (count: number): Promise<any> => {
        let docNo = (count + 1).toString().padStart(8, "0");
        const schedule = await db.m_running_number.findFirst({
          where: {
            last: docNo,
          },
        });
        if (schedule) {
          docNo = await getDocumentNo(count + 1);
        }
        return docNo;
      };
      const doc_no = await getDocumentNo(count);
      if (asset?.kso) {
        codeification = await getRunningNumber(
          "m_asset",
          `${asset.m_maintenance_group?.name}/${asset.m_category?.name}/KSO/${manufacture_year}`,
          doc_no,
        );
      } else {
        codeification = await getRunningNumber(
          "m_asset",
          `${asset?.m_maintenance_group?.name}/${asset?.m_category?.name}/Non/${manufacture_year}`,
          doc_no,
        );
      }
      await db.m_asset.update({
        where: {
          id: asset.id
        },
        data: {
          codeification
        }
      })
  }
};
