import dayjs from "dayjs";
import Calendar from "lib/comps/custom/Datepicker/components/Calendar";
import { useLocal } from "lib/utils/use-local";
import { FC, useState } from "react";
import DCalender from "./Cal";
import { formatDate } from "lib/comps/custom/Datepicker/helpers";
import { formatMoney } from "lib/exports";

export const CalenderMaintenance: FC<{
  onClick?: (date: Date) => void;
  onInit?: (data: any) => void;
}> = ({ onClick, onInit }) => {
  const local = useLocal(
    {
      tgl: [] as any[],
      date: new Date() as any,
      status: ["Not Started", "Open", "On Progress", "Waiting Closed"] as any[],
      load: async (date: Date) => {
        local.date = date;
        const {
          startOfPreviousMonth,
          startOfCurrentMonth,
          startOfNextMonth,
          endOfNextMonth,
        } = getMonthRanges(date);

        local.tgl = await db.v_calender_maintenance.findMany({
          where: {
            OR: [
              {
                date: {
                  gte: startOfPreviousMonth,
                  lt: startOfCurrentMonth,
                },
              },
              {
                date: {
                  gte: startOfCurrentMonth,
                  lt: startOfNextMonth,
                },
              },
              {
                date: {
                  gte: startOfNextMonth,
                  lt: endOfNextMonth,
                },
              },
            ],
            status: {
              in: local.status,
            },
          },
        });
        local.render();
      },
    },
    async () => {
      if (!isEditor) {
        const today = getDateRangeForDate(new Date());
        await db.t_preventive_work_order_header.updateMany({
          where: {
            preventive_date: today,
            status: "Not Started",
          },
          data: {
            status: "Open",
          },
        });
        await local.load(new Date());
        local.render();
        if (typeof onInit === "function") {
          onInit(local);
        }
      }
    }
  );

  return (
    <div
      className={cx(
        "c-flex-grow c-flex c-flex-row c-w-full c-h-full",
        css`
          .calender {
            width: 100% !important;
            display: flex;
            flex-direction: column;
          }
          .calender-body {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
          }
          .calender-days {
            flex-grow: 1;
            row-gap: 0;
          }
          .calender-grid {
            width: 100%;
            height: 100%;
            border-style: solid;
            border-color: black;
            border-top-width: 1px;
            border-bottom-width: 1px;
            border-right-width: 1px;
          }
          .calender-day-wrap {
            padding: 0.25rem;
          }
          .calender-grid:nth-child(7n + 1) {
            border-left-width: 1px;
            border-right-width: 0;
          }
          .calender-grid:nth-child(7n + 2) {
            border-left-width: 1px;
          }
          .calender-grid:nth-child(7n) {
            border-right-width: 1px;
            border-left-width: 0;
          }
          .calender-grid:nth-child(n + 8):nth-child(-n + 42) {
            border-top: 0; /* Atau bisa juga gunakan 'none' */
          }
        `
      )}
    >
      <DCalender
        value={{ startDate: local.date, endDate: local.date }}
        disabled={false}
        onMark={(day, date) => {
          if (Array.isArray(local.tgl) && local.tgl.length) {
            const l = local.tgl || [];
            const f = l.filter(
              (e) =>
                formatDate(dayjs(new Date(e.date)), "DD MMMM YYYY") ===
                formatDate(dayjs(date), "DD MMMM YYYY")
            );

            if (f.length > 0) {
              return (
                <div>
                  <div
                    className={cx(
                      "c-flex c-flex-row c-flex-wrap",
                      isMobile
                        ? css`
                            font-size: 10px !important;
                          `
                        : "c-text-xs"
                    )}
                  >
                    {f.map((e) => {
                      return (
                        <div
                          className={cx(
                            " c-text-black c-font-bold c-p-0.5 c-rounded-full c-text-center c-w-1/4",
                            isMobile ? "c-m-0.5" : "c-m-1",
                            e.status === "Not Started"
                              ? "c-bg-[#d9d9d9]"
                              : e.status === "Open"
                              ? "c-bg-[#a9d08e]"
                              : e.status === "On Progress"
                              ? "c-bg-yellow-200"
                              : e.status === "Waiting Closed"
                              ? "c-bg-[#f4b183]"
                              : e.status === "Closed"
                              ? "c-bg-[#9dc3e6]"
                              : ""
                          )}
                        >
                          {formatMoney(Number(e.count) || 0)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          }
          return <></>;
        }}
        style="google"
        displayFormat="DD MMM YYYY"
        mode={"daily"}
        maxDate={null}
        minDate={null}
        asSingle={true}
        useRange={false}
        onLoad={async (value: any) => {
          console.log(value);

          await local.load(value);
          local.render();
        }}
        onChange={async (value: any) => {
          if (!isEditor) {
            local.date = value?.startDate ? new Date(value?.startDate) : null;
            local.render();
            if (typeof onClick === "function") {
              await onClick(local.date);
            }
          }
        }}
      />
    </div>
  );
};
const getMonthRanges = (date: Date) => {
  const startOfCurrentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const startOfNextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  const startOfPreviousMonth = new Date(
    date.getFullYear(),
    date.getMonth() - 1,
    1
  );

  // Mendapatkan akhir bulan depan: awal bulan setelah bulan depan - 1 hari
  const endOfNextMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0);
  return {
    startOfPreviousMonth,
    startOfCurrentMonth,
    startOfNextMonth,
    endOfNextMonth,
  };
};
const getDateRangeForDate = (date: Date) => {
  // gte: hari ini jam 00:00:00 berdasarkan parameter Date
  const gte = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // lt: hari berikutnya jam 00:00:00 berdasarkan parameter Date
  const lt = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  return { gte, lt };
};
