import type {} from "../../typings/global";

const interval = {
  auto_close: null as any,
};

export const autoCloseStatus = async () => {
  clearInterval(interval.auto_close);
  interval.auto_close = setInterval(async () => {
    // jalanin sesuatu tiap 1000 ms * 60 detik * 10 menit
   
    const res = await db.t_complaint.updateMany({
      where: {
        fixed_at: { lte: new Date().toISOString() },
        status: "Request to Close",
      },
      data: { status: "Closed" },
    });
  }, 1000 * 60);
};
