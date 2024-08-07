import { getPathname } from "@/utils/pathname";
import dayjs from "dayjs";
import { loadSession } from "lib/preset/login/utils/load";
import { prasi_events } from "lib/utils/prasi-events";
import { generateDocumentNumber } from "./events/on_load/gen_doc_no";
import { onLoadOptionApproval } from "./events/on_load/load_approval";
import { onChangeWorkOrder, onLoadWorkOrder } from "./events/pages/work_order";
import { migrateWorkOrder } from "./events/migrate_wo";

prasi_events("form", "before_load", async (fm) => {
  const path = getPathname();

  if (path === "/d/maintenance/work-order")
    generateDocumentNumber(fm, "t_work_order", {});
});
prasi_events("tablelist", "after_load", async (table) => {
  const path = getPathname();
  const status = await db.t_work_order.findMany({
    where: { status: { equals: "Waiting Approval" } },
  });
  if (path === "/d/maintenance/work-order") {
    if (status) {
      await db.t_work_order.findMany({
        where: {
          m_maintenance_group: {
            m_maintenance_group_role: {
              some: {
                m_role: {
                  name: {
                    in: [
                      "Staff Maintenance",
                      "Maintenance Leader",
                      "Supervisor",
                    ],
                  },
                },
                m_maintenance_group_user: {
                  some: { m_user: { id: (window as any).user.id } },
                },
              },
            },
          },
        },
      });
    }
  }
});

prasi_events("field", "on_change", async (fm, field) => {
  const path = getPathname();
  if (path === "/d/maintenance/work-order") onChangeWorkOrder(fm, field);
});

prasi_events("field", "options_load", async (fm, field) => {
  const path = getPathname();
  onLoadOptionApproval(fm, field);
  if (path === "/d/maintenance/work-order") onLoadWorkOrder(fm, field);
});

prasi_events("form", "before_save", async (fm, record) => {
  const user = loadSession();
  if (user.id_client) record.id_client = user.id_client;
  record.created_by = (window as any).user.id;
});

prasi_events("form", "relation_before_save", async (table, record) => {
  const user = loadSession();
  if (user.id_client) record.id_client = user.id_client;
  record.created_by = (window as any).user.id;
});

prasi_events("tablelist", "where", async (table, where) => {
  const path = getPathname();

  if (path.startsWith("/d/maintenance/work-order/")) {
    where.status = {
      notIn: ["Draft"],
    };
  }
  if (path === "/d/complaint") {
    where.created_by = (window as any).user.id;
  }
  where.deleted_at = null;
});

prasi_events("form", "before_delete", async (md, fm) => {
  const table: any = fm.props.gen_table;
  await (db[table] as any).update({
    where: {
      id: fm.data.id,
    },
    data: {
      deleted_at: new Date(),
    },
  });
  return { preventDelete: true, navigateBack: true };
});

prasi_events("form", "after_save", async (fm, data) => {
  if (!data) return;
  const path = getPathname();
  if (path.startsWith("/d/maintenance/schedule")) migrateWorkOrder(fm, data);
});
