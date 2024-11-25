import dayjs from "dayjs";
import { formatDate } from "lib/comps/custom/Datepicker/helpers";

export const submit_depreciation = async (id: string) => {
  const w = window as unknown as {
    user: any;
  };
  const depr_detail = await db.t_depreciation_detail.findMany({
    where: {
      id_depreciation: id,
    },
    include: {
      m_asset: {
        include: {
          v_asset_depreciation: true,
        },
      },
      t_depreciation: true,
    },
  });
  if (depr_detail.length) {
    const v_depresiasi = await db.v_asset_depreciation.findMany({
      where: {
        id: {
          in: depr_detail.map((e: { id_asset: any; }) => e.id_asset),
        },
      },
    });
    let check = true;

    const detail = depr_detail.map((e: { id_asset: any; m_asset: { period_start: number; v_asset_depreciation: never[]; id: any; expense: any; asset_value: any; }; asset_period: any; t_depreciation: { period: string | number | Date; date_depreciation: any; }; }) => {
      // validasi
      const assetDepre = v_depresiasi.find((v: { id: any; }) => v.id === e.id_asset);
      let start_periode = e?.m_asset?.period_start || 0;
      let now_periode = e?.asset_period;
      let periode = assetDepre?.asset_period
        ? assetDepre?.asset_period + 1
        : start_periode;
      if (assetDepre && assetDepre.date_depre) {
        const lastDateDepre = new Date(assetDepre.date_depre);
        const currentDateDepre = new Date(e?.t_depreciation?.period);
        console.log(formatDate(dayjs(getNextMonth(lastDateDepre)), "MMMM YYYY") , formatDate(dayjs(currentDateDepre), "MMMM YYYY"));
        
        if (
          formatDate(dayjs(getNextMonth(lastDateDepre)), "MMMM YYYY") !==
          formatDate(dayjs(currentDateDepre), "MMMM YYYY")
        ) {
          // If the asset has been depreciated last month, set check to false
          check = false;
        }
      }
      const view:any[] = e?.m_asset?.v_asset_depreciation || [];

      const sum_expense = view?.[0]?.total_expense;
      return {
        id_asset: e?.m_asset?.id,
        expense: e?.m_asset?.expense,
        asset_period: periode,
        asset_cost: Number(e?.m_asset?.asset_value) || 0,
        remaining_amount:
          Number(e.m_asset?.asset_value) -
            (Number(sum_expense) + Number(e?.m_asset?.expense)) || 0,
        date_depre: e?.t_depreciation?.date_depreciation,
        period: e?.t_depreciation?.period,
        created_at: new Date(),
        created_by: w.user.id,
        id_client: w.user.id_client,
      };
    });
    if (check) {
      console.log(detail);
      await db.t_depreciation_expense.createMany({
        data: detail,
      });
      const id_asset: any[] = detail.map((e: { id_asset: any; }) => e.id_asset) || [];
      const v_depresiasi = await db.v_asset_depreciation.findMany({
        where: {
          id: {
            in: id_asset,
          },
        },
        select: {
          id: true,
          expense: true,
          asset_period: true,
          life: true,
          total_expense: true,
        },
      });
      if (v_depresiasi.length) {
        const depresiasi_asset: any[] = v_depresiasi.map((e: any) => {
          return {
            id: e.id,
            accumulated_depreciation_value: Number(e?.total_expense),
            remaining_depreciation_value:
              Number(e?.life) * Number(e?.expense) - Number(e?.total_expense),
          };
        });
        console.log({ depresiasi_asset });
        if (depresiasi_asset.length)
          await db._batch.upsert({
            table: "m_asset",
            where: {
              id: {
                in: id_asset,
              },
            },
            data: depresiasi_asset,
            mode: "relation",
          });
      }

      return true;
    }
    return false;
  }
};

export const getNextMonth = (date: Date) => {
  let currentDate = date;

  // Menambahkan satu bulan ke tanggal saat ini
  let nextMonthDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1
  );

  return nextMonthDate;
};
