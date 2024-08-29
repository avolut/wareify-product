import { toast } from "lib/comps/ui/toast";
import { Check } from "lucide-react";

export const toastReject = (text: string) => {
  toast.success(
    <div className={cx("c-flex c-flex-col c-select-none")} onClick={() => {}}>
      <div className="c-flex c-text-red-700 c-items-center">
        <Check className="c-h-4 c-w-4 c-mr-1 " />
        Rejected
      </div>
    </div>
  );
  
};
