import { useLocal } from "@/utils/use-local";
import { FC, useEffect } from "react";
import { client_ws } from "./lib/ws/client_ws";

export type NotificationType = {
  id: string;
  name: string;
  url: string;
  created_at: Date;
  created_by: string;
  read_at: Date | null;
  messages: string;
  id_receiver: string;
  deleted_at: Date | null;
  id_complaint: string | null;
  is_mobile: boolean | null;
};

export const Notif: FC<{
  child: any;
  PassProp: any;
  load: (e: any) => Promise<any>;
  click: () => {};
  props: any;
}> = ({ child, PassProp, props, load, click }) => {
  const local = useLocal({
    count: 0,
    notifikasi: [] as NotificationType[],
  });
  client_ws.local.notif = local;
  useEffect(() => {
    return () => {
      client_ws.disconnect();
    };
  }, []);

  return (
    <div
      {...props}
      className={cx(props.className, "c-cursor-pointer")}
      onClick={click}
    >
      <PassProp notif={local}>{child}</PassProp>
    </div>
  );
};
