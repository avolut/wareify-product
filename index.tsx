import "@/utils/init";
import "app/css/build.css";
import "app/events";
import { client_ws } from "app/lib/ws/client_ws";
// import { complaintRouter } from "app/server/complaint-router";
import { router } from "app/server/router";
import { newClientRouter } from "lib/server/server-route";
export * from "@/exports";
export * from "app/comps/DetailView";
export { ProgressBar } from "app/comps/ProgressBar";
export { parseDate } from "app/lib/date-indo";
export { global_style } from "app/style";

export {
  multipleDownloads,
  printQrLocationZpl,
  printQrZpl,
  printZplMultiple,
  QrDownload,
  QrSendToApi,
  sendMultipleQrsToApi,
} from "app/lib/qr-download";
export { QrLabel } from "lib/comps/custom/QrLabel";
export { QrReader } from "lib/comps/custom/QrReader";
export { QrScanner } from "lib/comps/custom/QrScanner";
export { QrReaderType } from "lib/comps/custom/typings";
export { PreviewAfterUpload } from "lib/comps/form/field/type/PreviewAfterUpload";
export {
  summonWebSocket,
  sendMonitoringComplaintBuilding,
} from "app/server/server-ws-old";
export { MonitoringComplaintType } from "app/server/ws/types";
// bridge
export { CalenderMaintenance } from "app/comps/CalenderMaintenance";
export { DashCal } from "app/comps/DashCal";
export { generateField } from "app/comps/gen/gen-field";
export { Loader } from "app/comps/Loader";
export { TableListEdit } from "app/comps/table-list-edit/TableListEdit";
export { exportAsset } from "app/excel/export-excel";
export { exportReportCorrective, get_staff} from "app/excel/export-report-corrective";
export { exportReportPreventif } from "app/excel/export-report-preventif";
export * from "app/icons";
export {
  filePreview,
  handleOpenCamera,
handleOpenFile,
  handleOpenFileComplaint,
  handleOpenFileFm,
  handleOpenWithChrome,
} from "app/lib/bridge";
export {treeMenu} from "app/lib/treeMenu"
export {DynamicIcon} from "app/comps/DynamicIcon";
export { empty_string } from "app/lib/empty_string";
export { gen_codeification } from "app/lib/gen-codeification";
export { gen_asset_schedule } from "app/lib/gen_asset_schedule";
export { gen_asset_schedule_line } from "app/lib/gen_asset_schedule_line";
export { gen_depreciation } from "app/lib/gen_depreciation";
export { getRunningNumber } from "app/lib/get-running-number";
export { get_value } from "app/lib/get_value";
export { insertLeader } from "app/lib/insert-leader";
export { insertWo } from "app/lib/insert-wo";
export { params_asset_filter } from "app/lib/params-asset-filter";
export { paramsLink } from "app/lib/params-link";
export { rangeDate,rangedDay } from "app/lib/rangeDate";
export { repetitive_date } from "app/lib/repetitive_date";
export { submit_depreciation } from "app/lib/submit_depreciation";
export { update_status_task } from "app/lib/update-status-task";
export { Mapping } from "app/mapping";
export { Notif } from "app/notification";
export { send_notification } from "app/send_notification";
export { toastReject } from "app/toast-reject";
export { toastSuccess } from "app/toast-success";
export { get_task } from "app/lib/get_task";
export { Button } from "lib/comps/ui/button";
export { client_ws } from "app/lib/ws/client_ws";

client_ws.connect();
export const _server = newClientRouter(router);
