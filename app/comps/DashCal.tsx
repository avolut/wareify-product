import dayjs from "dayjs";
import Calendar from "lib/comps/custom/Datepicker/components/Calendar";
import { useLocal } from "lib/utils/use-local";
import { FC, useState } from "react";
import DCalender from "./Cal";
import { formatDate } from "lib/comps/custom/Datepicker/helpers";
import { get_user } from "lib/exports";

export const DashCal: FC<{ onClick?: (date: Date) => void }> = ({
  onClick,
}) => {
  const local = useLocal(
    {
      tgl: [] as any[],
      date: new Date() as any,
    },
    async () => {
      local.tgl = await db.v_transaction_waiting_approval.findMany({
        where: {
          id_client: get_user("id_client"),
        },
      });
      local.render();
    }
  );

  return (
    <div
      className={css`
        /* .highlight {
          background: red !important;
          border-radius: 40px !important;
          color: white !important;
        } */
      `}
    >
      <DCalender
        value={{ startDate: local.date, endDate: local.date }}
        disabled={false}
        onMark={(day, date) => {
          if (Array.isArray(local.tgl) && local.tgl.length) {
            const l = local.tgl || [];
            const f = l.find(
              (e) =>
                formatDate(dayjs(new Date(e.tanggal)), "DD MMMM YYYY") ===
                formatDate(dayjs(date), "DD MMMM YYYY")
            );
            if (f)
              return (
                <div
                  className={cx(
                    "c-absolute",
                    css`
                      /* top: 105% !important;
                      transform: translate(-59%, -50%) !important;
                      left: 0 !important; */
                      position: absolute;
                      bottom: -5px;
                      left: 50%;
                      transform: translateX(-50%);
                    `
                  )}
                >
                  <div
                    className={cx(
                      "",
                      css`
                        padding: 4px;
                        background-color: #ff0000;
                        border-radius: 50%;
                      `
                    )}
                  ></div>
                </div>
              );
          }
          return <></>;
        }}
        displayFormat="DD MMM YYYY"
        mode={"daily"}
        maxDate={null}
        minDate={null}
        asSingle={true}
        useRange={false}
        onChange={async (value) => {
          local.date = value?.startDate ? new Date(value?.startDate) : null;
          local.render();
          if (typeof onClick === "function") {
            await onClick(local.date);
          }
        }}
        onLoad={async () => {}}
      />
    </div>
  );
};
