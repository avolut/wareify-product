import dayjs from "dayjs";
import Calendar from "lib/comps/custom/Datepicker/components/Calendar";
import { useLocal } from "lib/utils/use-local";
import { FC, useState } from "react";

export const DashCal: FC<{}> = () => {
  const local = useLocal(
    {
      tgl: [] as any[],
      date: new Date(),
    },
    async () => {
      local.tgl = await db.m_approval.findMany();
      local.render();
    }
  );

  return (
    <div
      className={css`
        .highlight {
          background: red !important;
          border-radius: 40px !important;
          color: white !important;
        }
      `}
    >
      <Calendar date={dayjs()} changeMonth={(e) => {
        console.log(e)
      }} changeYear={(e) => {
        console.log({e})
      }}/>
    </div>
  );
};
