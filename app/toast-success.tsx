import { toast } from "lib/comps/ui/toast";
import { Check } from "lucide-react";

export const toastSuccess = () => {
  toast.success(
    <div className={cx("c-flex c-flex-col c-select-none")} onClick={() => {}}>
      <div className="c-flex c-text-green-700 c-items-center">
        <Check className="c-h-4 c-w-4 c-mr-1 " />
        Saved
      </div>
    </div>
  );
  
};
