import { createId } from "@paralleldrive/cuid2";
import { generateSelect } from "lib/comps/md/gen/md-select";
import { createItem, parseGenField } from "lib/gen/utils";
import get from "lodash.get";
import { generateForm, generateTableList, genTableEdit } from "lib/exports";
import { on_load_rel } from "lib/comps/form/gen/on_load_rel";
import { getColumn } from "lib/comps/form/gen/gen-rel-many";

export const generateField = async (
  data: any,
  item: PrasiItem,
  commit: boolean
) => {
  let fieldType = getString(data.sub_type.value) as string;

  let table = getString(data.rel__gen_table.value) as string;
  const raw_fields = JSON.parse(data.rel__gen_fields.value) as (
    | string
    | { value: string; checked: string[] }
  )[];
  if (["checkbox", "button", "typeahead"].includes(fieldType)) {
    const fields = parseGenField(raw_fields);
    const res = generateSelect(fields);
    const master = fields.find(
      (e: any) => e.type === "has-one" && e.name !== table
    ) as any;
    const pk = fields.find((e: any) => get(e, "is_pk")) as any;
    const pk_master = master.relation.fields.find((e: any) => get(e, "is_pk"));

    const load = on_load_rel({
      pk: generateSelect(parseGenField(master.value.checked)).pk,
      table: master?.name,
      select: generateSelect(parseGenField(master.value.checked)).select,
      pks: {},
      type: fieldType,
    } as any);
    const result = {
      opt__on_load: load,
      opt__get_value: `\
        (arg: {
          options: { label: string; value: string; item?: string }[];
          fm: FMLocal;
          name: string;
          type: string;
        }) => {
          const { options, fm, name, type } = arg;
          if (isEditor) {
            return fm.data[name];
          }
          let result = null;
          result = fm.data[name];
          switch (type) {
            case "single-option":
              try {
                const data = fm.data[name];
                if (typeof data === "object") {
                  if (typeof data?.connect?.id !== "undefined") {
                    result = data.connect.id;
                  }else if (typeof data?.id !== "undefined") {
                    result = data.id;
                  }
                }
              } catch (ex) { }
              break;
            case "multi-option":
              const selected = [];
              const data = fm.data[name];
              if (Array.isArray(data) && data.length) {
                data.map((e) => {
                  try {
                    if (typeof e === "object") {
                      if (typeof e["${master.name}"].connect?.${pk_master.name} === "string") {
                        selected.push(e["${master.name}"].connect.${pk_master.name});
                      } else if (typeof e["${master.name}"]?.${pk_master.name} === "string") {
                        selected.push(e["${master.name}"].${pk_master.name});
                      }
                    }
                  } catch (ex) { }
                })
              }
              return selected;
              break;
          }
          return result;
        }
        `,
      opt__set_value: `\
        (arg: {
          selected: any[];
          options: { label: string; value: string; item?: string }[];
          fm: FMLocal;
          name: string;
          type: string;
        }) => {
          const { selected, options, fm, name, type } = arg;
          switch (type) {
            case "single-option":
              fm.data[name] = {
                connect: {
                  id: selected[0],
                },
              };
              break;
            case "multi-option":
              let parent = {} as any;
              const fields = parseGenField(fm.props.gen_fields);
              const res = generateSelect(fields);
              // try {
              //   parent = {
              //     [fm.props.gen_table]: {
              //       connect: {
              //         [res.pk]: fm.data.id || null,
              //       },
              //     },
              //   };
              // } catch (e) {}
              fm.data[name] = selected.map((e) => {
                return {
                  ${master.name}: {
                    connect: {
                      id: e,
                    },
                  },
                  ...parent,
                };
              });
              break;
            default: 
              fm.data[name] = selected.map((e) => e);
          }
          fm.render();
        }
        `,
      opt__label: `\
(
  row: { value: string; label: string; data?: any },
  mode: "list" | "label", opt: any
) => {
  const cols = ${JSON.stringify(
    getColumn(generateSelect(parseGenField(master.value.checked)))
  )};
  
  const prefix = treePrefix({
    //@ts-ignore
    rel__feature, rel__id_parent, row, mode, opt
  });

  if (isEditor) {
    return row.label;
  }
  const result = [];
  if (!!row.data && !row.label && !Array.isArray(row.data)) {
    if(cols.length > 0){
      cols.map((e) => {
        if (row.data[e]) {
          result.push(row.data[e]);
        }
      });
      return prefix + result.join(" - ");
    } else {
      const fields = parseGenField(rel__gen_fields);
      return prefix + fields
        .filter((e) => !e.is_pk)
        .map((e) => row.data[e.name])
        .filter((e) => e)
        .join(" - ");
    }
  }
  return prefix + row.label;
}
        `,
    } as any;
    Object.keys(result).map((e) => {
      item.edit.setProp(e, {
        mode: "raw",
        value: result[e],
      });
    });
    await item.edit.commit();
  } else if (["table-edit"].includes(fieldType)) {
    const result = {
      opt__on_load: "() => { return []; }",
      opt__get_value: `\
        (arg: {
            options: { label: string; value: string; item?: string }[];
            fm: FMLocal;
            name: string;
            type: string;
          }) => {
            const { options, fm, name, type } = arg;
            if (isEditor) {
              return fm.data[name];
            }
            let result = null;
            result = fm.data[name];
            switch (type) {
              case "single-option":
                try {
                  const data = fm.data[name];
                  if (typeof data === "object") {
                    if (typeof data?.connect?.id !== "undefined") {
                      result = data.connect.id;
                    }else if (typeof data?.id !== "undefined") {
                      result = data.id;
                    }
                  }
                } catch (ex) { }
                break;
            }
            return result;
        }
          `,
      opt__set_value: `\
        (arg: {
            selected: any[];
            options: { label: string; value: string; item?: string }[];
            fm: FMLocal;
            name: string;
            type: string;
          }) => {
            
            fm.render();
        }
        `,
      opt__label: `\
        (row: { value: string; label: string; item?: any }) => {
            return row.label;
        }
        `,
    } as any;
    Object.keys(result).map((e) => {
      item.edit.setProp(e, {
        mode: "raw",
        value: result[e],
      });
    });
    const res = (await genTableEdit(
      item,
      {
        gen__table: data.rel__gen_table,
        gen__fields: data.rel__gen_fields,
      },
      false
    )) as any;

    item.edit.setProp("child", {
      mode: "jsx",
      value: {
        id: createId(),
        name: "item",
        type: "item",
        edit: null as any,
        childs: res,
      },
    });
    await item.edit.commit();
  } else if (["table-list-edit"].includes(fieldType)) {
    const props: Record<string, PropVal> = {
      gen__table: {
        mode: "string",
        value: eval(data.rel__gen_table.value),
      },
      name: {
        mode: "string",
        value: eval(data.rel__gen_table.value),
      },
      generate: {
        mode: "string",
        value: "y",
      },
      label: {
        mode: "raw",
        value: "'Maintenance'",
      },
      opt__on_load: {
        mode: "string",
        value: "",
      },
      mode: {
        mode: "string",
        value: "auto",
      },
      opt__row_click: {
        mode: "raw",
        value:
          "({ row, rows, idx, event }: OnRowClick) => {\n  cn.data.navigate(`#root=${row.id}`)\n  ;\n};\n\ntype OnRowClick = {\n  row: any;\n  rows: any[];\n  idx: any;\n  event: React.MouseEvent<HTMLDivElement, MouseEvent>;\n}",
      },
      opt__selected: {
        mode: "raw",
        value: `\
  ({ row, rows, idx }: SelectedRow) => {
  try {
  if (typeof md === "object") {
  if (Array.isArray(md.selected)) {
  if (md.selected.length) {
    let select = md.selected.find((e) => e === row)
    if(select) return true
  }
  } else {
  if (md.selected === row) {
    return true;
  }
  }
  }
  } catch (e) {
  
  }
  return false;
  };
  
  type SelectedRow = {
  row: any;
  rows: any[];
  idx: any;
  }`,
      },
      gen__fields: {
        mode: "raw",
        value: data.rel__gen_fields.value,
      },
      child: {
        mode: "jsx",
        value: createItem({
          name: "halo",
          childs: [],
        }),
      },
    };
    const tablelist: any = {
      type: "item",
      name: "item",
      component: {
        id: "567d5362-2cc8-4ca5-a531-f771a5c866c2",
        props,
      },
    };

    await generateTableList(null, props, tablelist, { mode: "auto" }, false);
    const propsf: Record<string, PropVal> = {
      gen__table: {
        mode: "string",
        value: eval(data.rel__gen_table.value),
      },
      name: {
        mode: "string",
        value: eval(data.rel__gen_table.value),
      },

      gen__fields: {
        mode: "raw",
        value: data.rel__gen_fields.value,
      },
      deps: {
        mode: "raw",
        value: `({ md: typeof md !== "undefined" ? md : undefined })`,
      },
      on_load: {
        mode: "string",
        value: "",
      },
      on_submit: {
        mode: "string",
        value: "",
      },
      body: {
        mode: "jsx",
        value: createItem({
          name: "item",
          childs: [],
        }),
      },
    };
    const raw_new_item: any = {
      type: "item",
      name: "item",
      component: {
        id: "c4e65c26-4f36-48aa-a5b3-0771feac082e",
        props: propsf,
      },
    };
    await generateForm(
      async (props: any) => {},
      propsf,
      raw_new_item,
      false,
      false
    );

    const child = {
      id: "pdgb6jl3hcab1wa1imb5iz9x",
      name: "new_item",
      type: "item",
      dim: { w: "full", h: "full" },
      childs: [
        {
          id: "m0tjm6wn9p8pkitzrls8ra7v",
          adv: {
            css: "& {\n  display: flex;\n  // &.mobile {}\n  // &.desktop {}\n  // &:hover {}\n}",
          },
          dim: { h: 300, w: "full", hUnit: "px" },
          name: "list",
          type: "item",
          childs: [tablelist],
        },
      ],
      adv: { css: "" },
    };

    item.edit.setProp("child", {
      mode: "jsx",
      value: {
        id: createId(),
        name: "item",
        type: "item",
        edit: null as any,
        childs: child.childs as any,
      },
    });
    item.edit.setProp("label_action", {
      mode: "raw",
      value:
        '<Button\n  style={{ height: 28 ,gap: 5 }}\n  onClick={() => {\n    navigate(`${link__url}#root=+`, { breads: [{ label: link__text }] });\n  }}\n>\n  <svg\n    xmlns="http://www.w3.org/2000/svg"\n    width="16"\n    height="16"\n    viewBox="0 0 24 24"\n    fill="none"\n    stroke="currentColor"\n    stroke-width="2"\n    stroke-linecap="round"\n    stroke-linejoin="round"\n    class="lucide lucide-plus"\n  >\n    <path d="M5 12h14" />\n    <path d="M12 5v14" />\n  </svg>\n  Add New\n</Button>',
    });
    await item.edit.commit();
  }
};
export const getString = (data: string) => {
  let result = null;
  try {
    result = eval(data);
  } catch (e) {
    result = data;
  }
  return result;
};
