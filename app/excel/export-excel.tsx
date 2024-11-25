import * as XLSX from "xlsx";
import { shortDate } from "lib/exports";
import dayjs from "dayjs";
export const exportAsset = async (data_export: string) => {
  if (data_export.length === 0) return alert("Data Kosong!");
  const raw = data_export;
  // @ts-ignore
  const data = raw.map((item: any) => {
    return {
      Codeification: item.codeification,
      "Asset Name": item.name,
      Brand: item.brand,
      Type: item.type,
      "Serial Number": item.serial_number,
      Description: item.description,
      "Acquired Date": shortDate(item.acquired_date),
      status: item.asset_status,
      Location: item?.m_locatioin?.name,
      Category: item?.m_category?.name,
      height: item.dimesion_height,
      width: item.dimesion_width,
      weight: item.dimesion_weight,
      "Manufacture Year": dayjs(item.manufacture_year).format("YYYY"),
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  // Buat workbook dan tambahkan worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "list-ppds");
  // Ekspor file
  const date = new Date();
  XLSX.writeFile(
    wb,
    `list-asset ${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}.xlsx`
  );
};
