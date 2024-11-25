export const rangeDate = (date: any) => {
  const gte = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const lt = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  return { gte, lt };
};

export const rangedDay = (start: any, end: any) => {
  let result = {} as any
  if (start && start instanceof Date) {
    const gte = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    result = {...result, gte}
  }
  if (end && end instanceof Date) {
    const lt = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);
    result = {...result, lt}
  }
  return result
};
