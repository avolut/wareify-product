import { useLocal } from "@/utils/use-local";
import get from "lodash.get";
import { FC, useEffect } from "react";

export const ProgressBar: FC<{
  child: any;
  PassProp: any;
  props: any;
  task: any[];
  current: any;
  on_task: any[];
}> = ({ child, PassProp, props, task, current, on_task }) => {
  const local = useLocal({
    task: task,
    current: current,
    progress: 0 as number,
    current_task: [] as any[],
    list: [] as any[],
  });
  useEffect(() => {
    console.log({child, PassProp, props, task, current, on_task});
    console.log("halo", task);
    const list = task;
    local.list = list;
    local.render();
    console.log(Array.isArray(task))
    if (Array.isArray(list)) {
        
      const index = list.findIndex(item => item === current);
      console.log({index})
      const previousItems = current ? list.slice(0, index + 1) : [];
      const progress = (previousItems.length / list.length) * 100;
      local.progress = progress > 100 ? 100 : progress;
      local.current_task = previousItems;
      local.render();
      console.log({local})
    }
  }, [current, task]);
  return (
    <div {...props} className={cx(props.className, "c-cursor-pointer")}>
      <PassProp pbar={local}>{child}</PassProp>
    </div>
  );
};
