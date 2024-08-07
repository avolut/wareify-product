import { FieldLocal } from "lib/comps/form/typings";
import { FMLocal } from "lib/exports";

export const onChangeWorkOrder = (fm: FMLocal, field: FieldLocal) => {
  if (field.name === "m_maintenance_group") {
    fm.fields.m_maintenance_spv.reload_options();
  }
};

export const onLoadWorkOrder = (fm: FMLocal, field: FieldLocal) => {
  if (field.name === "m_maintenance_spv") {
    // reload..
  }
};
