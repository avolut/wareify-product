import { newServerRouter } from "lib/server/server-route";

export const router = newServerRouter({
  import_asset: ["/import-asset", () => import("./router/import/import_asset")],
  broadcast: ["/broadcast", () => import("./router/broadcast")],
  load_complaint: [
    "/complaint",
    () => import("./router/complaint/load-complaint"),
  ],
  load_wo: ["/wo", () => import("./router/wo/load-wo")],
  load_approval_schedule: [
    "/wo/approval_schedule",
    () => import("./router/wo/load-approval-schedule"),
  ],
});
