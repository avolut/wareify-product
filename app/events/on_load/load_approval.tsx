import { FieldLocal } from "lib/comps/form/typings";
import { FMLocal } from "lib/exports";

export const onLoadOptionApproval = async (fm: FMLocal, field: FieldLocal) => {
  /*
    if (field.name === "m_user_approval") {
      const where: Prisma.m_userWhereInput = {
        m_maintenance_group_user: {
          some: {
            m_maintenance_group_role: {
              m_role: { name: { equals: "Maintenance Leader" } },
              m_maintenance_group: {
                deleted_at: { in: null },
              },
            },
          },
        },
      };
      return where;
    }
    if (getPathname() === "/d/asset") {
      if (field.name === "m_category") {
          const where: Prisma.m_categoryWhereInput= {
              m_category: {summary_level: {equals: true}}
          }
      }
    }
      */
};
