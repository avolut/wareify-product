import { bulk_query } from "lib/exports";

export const params_asset_filter = async (data: any, name: string) => {
  let param = {} as any;
  const keys = ["id_location", "id_category", "id_maintenance_group"];
  await bulk_query({
    list: keys,
    task: async (e) => {
      if (data?.[e]) {
        param = {
          ...param,
          [e]: data?.[e],
        };
      }
    },
  });
  switch (name) {
    case "id_location":
      delete param.id_location;
      return {
        m_asset: {
          some: param,
        },
      };
      break;

      case "id_category":
        delete param.id_category;
        return {
          m_asset: {
            some: param,
          },
        };
        break;
  
        case "id_maintenance_group":
            delete param.id_maintenance_group;
            return {
              m_asset: {
                some: param,
              },
            };
            break;
    default:
      break;
  }
  return {}
};
