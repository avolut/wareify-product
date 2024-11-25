import { navigateLink } from "lib/comps/form/field/type/TypeLink";
import { FieldLocal, FieldProp } from "lib/comps/form/typings";
import { FMLocal } from "lib/exports";
import { useLocal } from "lib/utils/use-local";
import get from "lodash.get";
import { FC } from "react";

export const TableListEdit: FC<{
  on_init: () => FMLocal;
  name: string;
  child: any;
  PassProp: any;
  item: PrasiItem;
  show_header?: "y" | "n";
  bottom: any;
  body: any;
  field: FieldLocal;
  arg: FieldProp;
  fm: FMLocal;
}> = ({
  on_init,
  name,
  child,
  PassProp,
  item,
  bottom,
  show_header,
  arg,
  field,
  fm,
}) => {
  const list = item?.component?.props?.child?.content?.childs[0];
  const headerComponent = useLocal({
    data: {
      open: false,
      selected: null,
      navigate: (params: any) => {
        navigateLink(arg.link, field, fm.deps.md, params);
      },

    },
  });

  return (
    <div style={{ width: "100%" }}>
      <PassProp cn={headerComponent}>{list}</PassProp>
    </div>
  );
};

function getProp(child: any, name: string, defaultValue?: any) {
  const fn = new Function(
    `return ${get(child, `component.props.${name}.valueBuilt`) || `null`}`
  );

  return fn() || defaultValue;
}
