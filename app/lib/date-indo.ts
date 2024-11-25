export const parseDate = (dateString: string, format: string): Date | null => {
  if (typeof dateString === "number") {
    return excelDateToJSDate(dateString);
  }
  if (typeof dateString === "string" && format === "mm/dd/yyyy") {
    if (dateString) return new Date(dateString);
    return null;
  }
  if (format) {
    const del = format.match(/[^a-zA-Z]/);
    if (Array.isArray(del)) {
      const delimiter = del[0];
      const parts = dateString.split(delimiter);
      const formatParts = format.split(delimiter);

      let day: string | undefined;
      let month: number | undefined;
      let year: string | undefined;

      // Menentukan urutan hari, bulan, dan tahun berdasarkan format
      formatParts.forEach((part, index) => {
        if (part === "dd") {
          day = parts[index].padStart(2, "0"); // Pad 0 jika day satu digit
        } else if (part === "mm") {
          month = Number(parts[index].padStart(2, "0")) - 1; // Pad 0 jika month satu digit, dikurangi 1 untuk Januari
        } else if (part === "yyyy") {
          year = parts[index];
        }
      });
      return new Date(Number(year), month as number, Number(day));
    }
  }
  return new Date(dateString);
};
const excelDateToJSDate = (excelDate: number) => {
  const startDate = new Date(1900, 0, 1); // 1 Januari 1900
  const adjustedDate = new Date(
    startDate.getTime() + (excelDate - 1) * 24 * 60 * 60 * 1000
  ); // -2 untuk menyesuaikan bug leap year
  adjustedDate.setHours(8, 0, 0, 0); // Set waktu ke 08:00:00
  return adjustedDate;
};
