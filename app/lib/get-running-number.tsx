export const getRunningNumber = async (table: string, prefix: string, first_number?: number) => {
  let rn = await db.m_running_number.findFirst({
    where: { table: table, prefix: prefix },
  });
  if (!rn) {
    rn = await db.m_running_number.create({
      data: { table: table, prefix: prefix, last: first_number?.toString() || "0000000" },
    });
  }

  rn.last = (parseInt(rn.last) + 1).toString().padStart(7, "0");

  await db.m_running_number.update({
    where: {
      id: rn.id,
    },
    data: {
      last: rn.last,
    },
  });

  return `${prefix}/${rn.last}`;
};

