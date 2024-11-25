import { prasiApi } from "lib/server/server-route";
import { server_ws } from "../server-ws";
import { WS_MSG } from "../ws/types";

export default prasiApi(async (user_id: string, message: WS_MSG) => {
  server_ws.broadcast(user_id, message);
  return {
    status: `OK`,
  };
});
