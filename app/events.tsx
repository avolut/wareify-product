import { getPathname } from "@/utils/pathname";
import { loadSession } from "lib/preset/login/utils/load";
import { prasi_events } from "lib/utils/prasi-events";
import { changeStatusWO } from "./events/change-status-wo";
import { migrateWorkOrder } from "./events/migrate-wo";
import { generateDocumentNumber } from "./events/on_load/gen_doc_no";
import { generateArrayNumber } from "lib/comps/custom/Datepicker/helpers";
import dayjs from "dayjs";
import { migrateWorkOrderLoad } from "./events/on_load/migrate-wo-load";

prasi_events("form", "after_load", async (fm) => {
  const path = getPathname({ hash: false });
  if (path === "/d/maintenance/work-order")
    generateDocumentNumber(fm, "t_work_order");
  if (path === "/d/complaint") generateDocumentNumber(fm, "t_work_order");
  // if (path === "/d/asset") generateArrayNumber(fm, "t_work_order");
});
prasi_events("tablelist", "where", async (table, where) => {
  if (table === "t_work_order") {
    where.status = "Waiting Approval";
  }
  return where;
});
prasi_events("field", "relation_load", async (fm, field) => {
  if (field.name === "m_category") {
    return { deleted_at: null };
  }
  return {};
});

prasi_events("tablelist", "after_load", async (table) => {
  const path = getPathname({ hash: false });
  const status = await db.t_work_order.findMany({
    where: { status: { equals: "Waiting Approval" } },
  });
  if (path === "/d/admin/dashboard/approval/complaint") {
    await db.t_work_order.findMany({
      where: {
        status: "Waiting Approval",
        m_maintenance_group: {
          m_maintenance_group_role: {
            some: {
              m_role: {
                name: {
                  in: ["Staff Maintenance", "Maintenance Leader", "Supervisor"],
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
  if (path === "/d/maintenance/work-order") {
    migrateWorkOrderLoad();
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

//   const path = getPathname();
//   if (path === "/d/maintenance/work-order") onChangeWorkOrder(fm, field);
// });

// prasi_events("field", "options_load", async (fm, field) => {
//   const path = getPathname();
//   let list = null;
//   onLoadOptionApproval(fm, field);
//   if (path === "/d/maintenance/work-order") onLoadWorkOrder(fm, field);
//   return list;
// });

prasi_events("form", "before_save", async (fm, record) => {
  const user = loadSession();
  const path = getPathname();

  if (user.id_client) record.id_client = user.id_client;
  if (path === "/d/maintenance/work-order") {
  }
});

prasi_events("form", "relation_before_save", async (table, record) => {
  const user = loadSession();
  if (user.id_client) record.id_client = user.id_client;
});

prasi_events("tablelist", "where", async (table, where) => {
  const path = getPathname();

  if (path.startsWith("/d/maintenance/work-order/")) {
    where.status = {
      notIn: ["Draft"],
    };
  }

  where.deleted_at = null;
});
prasi_events("field", "on_change", async (fm, field) => {
  const path = getPathname({ hash: false });
  if (path === "/d/admin/dashboard/approval/complaint") {
  }
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
  if (path.startsWith("/d/admin/dashboard/approval/schedule"))
    migrateWorkOrder(fm, data);
  if (path.startsWith("/d/maintenance/work-order")) changeStatusWO(fm, data);
});
