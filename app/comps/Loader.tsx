import { useLocal } from "lib/utils/use-local";
import { FC, useEffect } from "react";

export const Loader: FC<{
  data: any;
  load: (e: any) => Promise<void>;
  PassProp: any;
  children: any;
  props: any;
}> = ({ data, load, PassProp, children, props }) => {
  const local = useLocal({
    ...data,
  });
  useEffect(() => {
    const reload = async () => {
      await load(local);
    };
    reload();
  }, []);
  return (
    <div {...props} className={cx(props.className, "")}>
      <PassProp ph={local}>{children}</PassProp>
    </div>
  );
};
