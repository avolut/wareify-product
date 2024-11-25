import { useLocal } from "@/utils/use-local";
import { FMLocal } from "lib/exports";
import get from "lodash.get";
import { FC, useEffect } from "react";

export const Mapping: FC<{
  child: any;
  PassProp: any;
  data: any[];
  props: any;
  fm: FMLocal;
}> = ({ child, PassProp, props, data, fm }) => {
  const local = useLocal({
    data: [] as any[],
  });
  useEffect(() => {
    console.log("EFFECT", fm)
    if (Array.isArray(data)) {
      local.data = data;
      local.render();
    }
  }, [data]);
  return (
    <div {...props} className={cx(
        props.className,
        "c-overflow-x-scroll",
        css`
        overflow-x: scroll;
    `,
      )}>
      {data.map((e, idx) => {
        return (
          <>
            <PassProp item={e} idx={idx}>
              {child}
            </PassProp>
          </>
        );
      })}
    </div>
  );
};
