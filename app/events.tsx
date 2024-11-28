import { getPathname } from "@/utils/pathname";
import { loadSession } from "lib/preset/login/utils/load";
import { prasi_events } from "lib/utils/prasi-events";
import { changeStatusWO } from "./events/change-status-wo";
import { migrateWorkOrder } from "./events/migrate-wo";
import { generateDocumentNumber } from "./events/on_load/gen_doc_no";
import { generateArrayNumber } from "lib/comps/custom/Datepicker/helpers";
import dayjs from "dayjs";
import { migrateWorkOrderLoad } from "./events/on_load/migrate-wo-load";
import { get_user } from "lib/exports";

prasi_events("form", "after_load", async (fm) => {
  const path = getPathname({ hash: false });
  // if (path === "/d/maintenance/work-order")
  // generateDocumentNumber(fm, "t_work_order");
  // if (path === "/d/complaint") generateDocumentNumber(fm, "t_work_order");
});
prasi_events("tablelist", "where", async (table, where) => {
  // where.deleted_at = null;
  return where;
});
prasi_events("field", "relation_load", async (fm, field) => {
  return {
    deleted_at: null,
  };
});

prasi_events("tablelist", "after_load", async (table, items, modify) => {
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
  if (path === "/d/maintenance/work-order") {
    modify(
      items.map((item: any, index: number) => {
        return {
          ...item,
          t_maintenance_task:
            item?.t_maintenance_task
              .map((task: any) => task?.m_user?.name)
              .join(", ") || "",
        };
      })
    );
  }
  // if (path === "/d/asset/detail") {
  //   const movement = items.map((item: any) => item.movement_date);
  //   console.log(movement.length > 0)
  //   if (movement) {
  //     modify(
  //       items.map((item: any, index: number) => {
  //         return {
  //           ...item,
  //           updated_by:
  //             item?.t_movement_line
  //               .map((task: any) => task?.location_from?.name)
  //               .join(", ") || "",
  //           t_movement_line:
  //             item?.t_movement_line
  //               .map((task: any) => task?.location_to?.name)
  //               .join(", ") || "",
  //         };
  //       })
  //     );
  //   }
  // }

  // if (path === "/d/admin/reports-cloned") {
  //   modify(
  //     items.map((item: any, index: number) => {
  //       return {
  //         ...item,
  //         t_maintenance_task:
  //           item?.t_maintenance_task
  //             .map((task: any) => task?.task_description)
  //             .join(", ") || "",
  //       };
  //     })
  //   );
  //   modify(
  //     items.map((item: any, index: number) => {
  //       return {
  //         ...item,
  //         t_history_task:
  //           [
  //             ...new Set(
  //               item?.t_history_task.flatMap((task: any) => {
  //                 const assign_staff =
  //                   task?.t_maintenance_task?.m_user?.name || "";
  //                 const fixed_user = task?.m_user?.name || "";
  //                 const hand_over_user = task?.hand_over_user?.name || "";
  //                 const take_over_user = task?.take_over_user?.name || "";
  //                 return [
  //                   assign_staff,
  //                   fixed_user,
  //                   hand_over_user,
  //                   take_over_user,
  //                 ];
  //               })
  //             ),
  //           ]
  //             .filter(Boolean) // Removes empty strings
  //             .join(", ") || "",
  //       };
  //     })
  //   );
  // }

  if (path === "/d/monitoring/workorder/it") {
    const modifiedItems = items.map((item: any) => {
      return {
        ...item,
        t_maintenance_task:
          [
            ...new Set(
              item.t_maintenance_task.flatMap((task: any) => {
                const taskUser = task?.m_user?.name || ""; // m_user from t_maintenance_task
                return task.t_history_task.flatMap((history: any) => {
                  const historyUser = history?.m_user?.name || ""; // m_user from t_history_task
                  const takeOverUser = history?.take_over_user?.name || ""; // take_over_user from t_history_task
                  return [taskUser, historyUser, takeOverUser];
                });
              })
            ),
          ]
            .filter(Boolean) // Removes empty strings
            .join(", ") || "",
      };
    });
    modify(modifiedItems);
  }
  if (path === "/d/admin/reports" || path === "/d/admin/reports-cloned") {
    console.log(items);

    modify(
      items.map((item: any, index: number) => {
        return {
          ...item,
          t_history_task:
            [
              ...new Set(
                item?.t_history_task.flatMap((task: any) => {
                  const assign_staff =
                    task?.t_maintenance_task?.m_user?.name || "";
                  const fixed_user = task?.m_user?.name || "";
                  const hand_over_user = task?.hand_over_user?.name || "";
                  const take_over_user = task?.take_over_user?.name || "";
                  return [
                    assign_staff,
                    fixed_user,
                    hand_over_user,
                    take_over_user,
                  ];
                })
              ),
            ]
              .filter(Boolean) // Removes empty strings
              .join(", ") || "",
        };
      })
    );
  }
});

prasi_events("form", "before_save", async (fm, record) => {
  const user = loadSession();
  const path = getPathname();
  const field_rel = [] as any[];
  if (
    typeof fm?.field_def === "object" &&
    Object.entries(fm?.field_def).length
  ) {
    for (const [k, v] of Object.entries(fm?.field_def) as any) {
      if (v?.type === "has-one") {
        const field = v?.relation?.fields || [];
        const pk = field.find((e: { is_pk: any }) => e?.is_pk);
        if (pk) {
          if (!record?.[k]) {
            delete record[k];
          }
        }
      }
    }
  }

  if (user.id_client) record.id_client = user.id_client;
  if (path === "/d/maintenance/work-order") {
  }
  if (path === "/d/asset") {
    const life = Number(record.usable_life) || 0;
    if (life) {
      record.life = life * 12;
    }
    const price_asset = Number(record.asset_value) || 0;
    if (life && price_asset && record?.depreciate) {
      record.expense = price_asset / (life * 12);
    }
    record.book_value =
      price_asset - record?.period_start * record?.expense || 0;
    console.log(record.book_value);
  }
  if (path === "/master/menu-client") {
    record.m_menu_client = record.menu?.length
      ? record.menu.map((e: any) => {
          return {
            id_menu: e,
          };
        })
      : [];
  }
  if (path === "/master/menu-role") {
    record.m_role_menu = record.menu?.length
      ? record.menu.map((e: any) => {
          return {
            id_menu: e,
          };
        })
      : [];
  }
});

prasi_events("form", "relation_before_save", async (table, record) => {
  const user = loadSession();
  if (user.id_client) record.id_client = user.id_client;
});

prasi_events("tablelist", "where", async (table, where) => {
  const path = getPathname();

  if (
    !path.startsWith("/master/menu-role") &&
    !path.startsWith("/master/client") &&
    !path.startsWith("/master/menu-client")  &&
    !path.startsWith("/d/manage-role") &&
    !path.startsWith("/manage-user-client") &&
    !path.startsWith("/d/admin/manage-user/role/menu-") &&
    !path.startsWith("/d/group-role")
  ) {
    where.id_client = get_user("id_client");
  }
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
