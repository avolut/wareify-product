import * as XLSX from "xlsx";
import { formatDay, shortDate } from "lib/exports";
import dayjs from "dayjs";
import { paramsLink } from "app/lib/params-link";
import { formatDate } from "lib/comps/custom/Datepicker/helpers";
import get from "lodash.get";
export const exportReportCorrective = async () => {
  let where = {
    deleted_at: null,
  } as any;
  const link = await paramsLink();
  const paramsWhere = link?.[0]?.where?.where || null;
  where = {
    ...where,
    ...paramsWhere,
  };
  let params: any = {
    select: {
      id: true,
      t_work_order: {
        select: {
          id: true,
          m_asset: {
            select: {
              id: true,
              name: true,
            },
          },
          wo_no: true,
          complaint_date_request: true,
        },
      },
      task_description: true,
      t_history_task: {
        select: {
          id: true,
          m_user: {
            select: {
              id: true,
              name: true,
            },
          },
          hand_over_user: {
            select: {
              id: true,
              name: true,
            },
          },
          take_over_user: {
            select: {
              id: true,
              name: true,
            },
          },
          t_maintenance_task: {
            select: {
              id: true,
              m_user: true,
            },
          },
        },
      },
      created_at: true,
      status: true,
    },
    orderBy: {
      t_work_order: {
        m_asset: {
          name: "desc",
        },
      },
    },
    where: where,
  };
  const result = { items: [] };
  result.items = await db.t_maintenance_task.findMany(params);
  const groupedData = result.items.reduce((acc: any, item: any) => {
    const assetName = item?.t_work_order?.m_asset?.name;

    if (!assetName) return acc; // If no asset name, skip

    // Check if the asset name already exists in the accumulator
    const existingAsset = acc.find((asset: any) => asset.name === assetName);
    const existingWO = acc.find(
      (ex: any) =>
        ex.t_work_order?.wo_no === item?.t_work_order?.wo_no &&
        ex.name === assetName
    );
    if (existingAsset) {
      // If asset already exists, push a new entry with an empty name
      acc.push({
        name: "", // Change the name to an empty string
        task: item?.task_description,
        ...item,
        t_work_order: {
          ...item?.t_work_order,
          wo_no: existingWO ? "" : item?.t_work_order?.wo_no,
          m_asset: {
            ...item?.t_work_order?.m_asset,
            name: "",
          },
        },
      });
    } else {
      // If asset does not exist, create a new entry for this asset
      acc.push({
        name: assetName,
        task: item?.task_description,
        ...item,
        t_work_order: {
          ...item?.t_work_order,
          m_asset: {
            ...item?.t_work_order?.m_asset,
            name: assetName,
          },
        },
      });
    }

    return acc;
  }, []);

  const excel = groupedData.map((item: any) => {
    return {
      "Work Order Number": item?.t_work_order?.wo_no,
      Asset: item?.t_work_order?.m_asset?.name,
      "Date Request": formatDate(
        dayjs(item?.t_work_order?.complaint_date_request),
        "DD MMMM YYYY"
      ),
      Task: item.task_description,
      Staff: get_staff(item.t_history_task),
      Status: item.status,
    };
  });

  const ws = XLSX.utils.json_to_sheet(excel);
  // Buat workbook dan tambahkan worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "report-corrective");
  // Ekspor file
  const date = new Date();
  XLSX.writeFile(
    wb,
    `report-corrective ${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}.xlsx`
  );
};

const getUniqueArray = (array: string[]): string[] => {
  return [...new Set(array)];
};
export const get_staff = (data: any[]) => {
  const staff = [] as any[];
  data.map((e) => {
    const rels = [
      "m_user.name",
      "hand_over_user.name",
      "take_over_user.name",
      "t_maintenance_task.m_user.name",
    ];
    rels.map((ex) => {
      if (get(e, ex)) {
        staff.push(get(e, ex));
      }
    });
  });
  return getUniqueArray(staff);
};
