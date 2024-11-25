import * as XLSX from "xlsx";
import { formatDay, shortDate } from "lib/exports";
import dayjs from "dayjs";
import { paramsLink } from "app/lib/params-link";
import { formatDate } from "lib/comps/custom/Datepicker/helpers";
export const exportReportPreventif = async () => {
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
      name: true,
      status: true,
      m_user: {
        select: {
          id: true,
          name: true,
        },
      },
      t_preventive_work_order_header: {
        select: {
          id: true,
          preventive_date: true,
          pwo: true,
          m_maintenance_schedule_line: {
            select: {
              id: true,
              m_maintenance_schedule_header: true,
            },
          },
          m_asset: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        t_preventive_work_order_header: {
          m_asset: {
            name: "asc",
          },
        },
      },
      {
        t_preventive_work_order_header: {
          m_maintenance_schedule_line: {
            m_maintenance_schedule_header: {
              doc_no: "asc",
            },
          },
        },
      },
    ],
    where: where,
  };
  const result = { items: [] };
  result.items = await db.t_preventive_work_order_line.findMany(params);
  const data = result.items.reduce((list: any, item: any) => {
    list.push({
      ...item,
      t_preventive_work_order_header: {
        ...item.t_preventive_work_order_header,
        m_maintenance_schedule_line: {
          ...item.t_preventive_work_order_header?.m_maintenance_schedule_line,
          m_maintenance_schedule_header: {
            ...item.t_preventive_work_order_header?.m_maintenance_schedule_line
              ?.m_maintenance_schedule_header,
            doc_no: list.find(
              (ex) =>
                ex?.t_preventive_work_order_header?.m_maintenance_schedule_line
                  ?.m_maintenance_schedule_header?.doc_no ===
                  item?.t_preventive_work_order_header
                    ?.m_maintenance_schedule_line?.m_maintenance_schedule_header
                    ?.doc_no &&
                ex?.t_preventive_work_order_header?.m_asset?.name ===
                  item?.t_preventive_work_order_header?.m_asset?.name
            )
              ? ""
              : item?.t_preventive_work_order_header
                  ?.m_maintenance_schedule_line?.m_maintenance_schedule_header
                  ?.doc_no,
          },
        },
        m_asset: {
          ...item.t_preventive_work_order_header.m_asset,
          name: list.find(
            (ex) =>
              ex?.t_preventive_work_order_header?.m_asset?.name ===
              item?.t_preventive_work_order_header?.m_asset?.name
          )
            ? ""
            : item?.t_preventive_work_order_header?.m_asset?.name,
        },
      },
    });
    return list;
  }, []);

  const getUniqueArray = (array: string[]): string[] => {
    return [...new Set(array)];
  };
  result.items = data;
  const excel = result.items.map((item: any) => {
    return {
      "Schedule Number": item?.t_preventive_work_order_header?.pwo,
      "Document Number":
        item?.t_preventive_work_order_header?.m_maintenance_schedule_line?.m_maintenance_schedule_header
          ?.doc_no,
      Asset: item?.t_preventive_work_order_header?.m_asset?.name,
      "Date Request": formatDate(dayjs(item?.t_preventive_work_order_header?.preventive_date), "DD MMMM YYYY"),
      Task: item.name,
      Staff: item?.m_user?.name,
      Status: item.status,
    };
  });

  const ws = XLSX.utils.json_to_sheet(excel);
  // Buat workbook dan tambahkan worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "report-preventif");
  // Ekspor file
  const date = new Date();
  XLSX.writeFile(
    wb,
    `report-preventif ${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}.xlsx`
  );
};
