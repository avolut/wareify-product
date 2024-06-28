import { loadSession } from "lib/preset/login/utils/load";
import { prasi_events } from "lib/utils/prasi-events";

prasi_events("form", "before_save", async (fm, record) => {
  const user = loadSession();
  if (user.id_client) record.id_client = user.id_client;
});

prasi_events("tablelist", "where", async (table, where) => {
  where.deleted_at = null;
});
