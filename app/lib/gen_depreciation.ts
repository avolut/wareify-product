import dayjs from "dayjs";
import { formatDate } from "lib/comps/custom/Datepicker/helpers";
import { getNextMonth } from "./submit_depreciation";

export const gen_depreciation = async (id: string) => {
  const w = window as unknown as {
    user: any;
  };
  const depr_detail = await db.t_depreciation_detail.count({
    where: {
      id_depreciation: id,
    },
  });
  if (!depr_detail || true) {
    const depr = await db.t_depreciation.findFirst({
      where: {
        id,
      },
    });
    if (depr) {
      const id_category = depr?.id_category;
      const id_maintenance_group = depr?.id_maintenance_group;
      const assetFilter: any = {
        remaining_amount: {
          gt: 0,
        },
        m_asset: {}, // Initialize as an empty object for dynamic conditions
      };

      // Add condition for id_category if it's not null
      if (id_category) {
        assetFilter.m_asset["id_category"] = id_category;
      }

      // Add condition for id_maintenance_group if it's not null
      if (id_maintenance_group) {
        assetFilter.m_asset["id_maintenance_group"] = id_maintenance_group;
      }

      // Find assets in v_asset_depreciation based on the filters
      const limit = startAndEndTimeOfMonth(new Date(depr.period))
      const expense = await db.v_asset_depreciation.findMany({
        where: assetFilter,
        include: {
          m_asset: {
            include: {
              t_depreciation_expense: {
                where: {
                  period: {
                    lte: limit.endOfMonth,
                    gte: limit.startOfMonth
                  }
                }
              }
            }
          },
        },
      });
      if (expense.length) {
        const detail = [] as any[];
        expense.map((e: any) => {
          // Calculate the asset period based on date_depre
          let asset_period = e?.asset_period + 1; // Default increment by 1 if no date_depr
          if (!e.asset_period) {
            asset_period = e.m_asset.period_start;
            if (!asset_period) asset_period = e?.asset_period + 1;
          }
          // Bandingkan tahun dan bulan
          if (
            asset_period <= e?.m_asset?.life &&
            asset_period > e.asset_period &&
            !e?.m_asset?.t_depreciation_expense?.length
          ) {
            detail.push({
              id_asset: e.id,
              id_depreciation: id,
              id_departement: e?.m_asset?.id_maintenance_group,
              asset_period: asset_period,
              expense_value: e?.expense,
              created_at: new Date(),
              created_by: w.user.id,
              id_client: w.user.id_client,
            });
          }
        });
        if (detail.length)
          await db.t_depreciation_detail.createMany({
            data: detail,
          });
      }
    }
  }
};
const  startAndEndTimeOfMonth = (currentDate: Date) => {
  
  // Mendapatkan tanggal awal bulan dengan jam 00:00:00
  let startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0);
  
  // Mendapatkan tanggal akhir bulan dengan jam 23:59:59
  let endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
  
  return {
    startOfMonth: startOfMonth,
    endOfMonth: endOfMonth
  };
}