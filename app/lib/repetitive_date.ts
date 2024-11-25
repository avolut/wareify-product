type RepeatType = "daily" | "weekly" | "monthly" | "yearly" | "one time";

interface Options {
  weeks?: string[] | any[]; // For weekly
  onDay?: number | any; // For monthly and yearly
  onMonth?: string | any; // For yearly
}

export const repetitive_date = (
  startDate: Date,
  endDate: Date,
  repeatInterval: number | any,
  type: RepeatType,
  options: Options = {}
): Date[] => {
  if (type === "one time") {
    return [new Date(startDate)];
  }
  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  let dates: Date[] = [];
  let currentDate: Date = new Date(startDate);
  let end: Date = new Date(endDate);

  // Set time to 6 AM for a given date
  const setToSixAM = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(8, 0, 0, 0); // Set time to 6:00:00 AM
    return newDate;
  };

  const getNextDayOfWeek = (date: Date, dayName: string): Date => {
    let dayIndex = dayNames.indexOf(dayName.toLowerCase());
    if (dayIndex === -1) throw new Error("Invalid day name");

    let resultDate = new Date(date);
    let diff = (dayIndex + 7 - resultDate.getDay()) % 7;
    resultDate.setDate(resultDate.getDate() + diff);
    return setToSixAM(resultDate); // Ensure the time is 6 AM
  };

  // Only calculate month index for yearly validation
  let onMonthIndex = 0;
  if (type === "yearly" && options.onMonth) {
    onMonthIndex = monthNames.indexOf(options.onMonth.toLowerCase()) + 1;
    if (onMonthIndex === 0) throw new Error("Invalid month name");
  }

  while (currentDate <= end) {
    switch (type) {
      case "daily":
        dates.push(setToSixAM(currentDate)); // Set time to 6 AM
        currentDate.setDate(currentDate.getDate() + repeatInterval);
        break;

      case "weekly":
        if (options.weeks) {
          options.weeks.forEach((day) => {
            const nextDate = getNextDayOfWeek(currentDate, day);
            if (nextDate <= end) dates.push(setToSixAM(nextDate));
          });
        }
        currentDate.setDate(currentDate.getDate() + repeatInterval * 7);
        break;

      case "monthly":
        if (options.onDay) {
          const validDay = Math.min(
            options.onDay,
            new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              0
            ).getDate()
          );
          const nextMonthDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            validDay
          );
          if (nextMonthDate <= end) dates.push(setToSixAM(nextMonthDate));
        }
        currentDate.setMonth(currentDate.getMonth() + repeatInterval);
        break;

      case "yearly":
        if (options.onDay) {
          const yearlyValidDate = new Date(
            currentDate.getFullYear(),
            onMonthIndex - 1,
            options.onDay
          );
          if (yearlyValidDate <= end) dates.push(setToSixAM(yearlyValidDate));
        }
        currentDate.setFullYear(currentDate.getFullYear() + repeatInterval);
        break;

      default:
        throw new Error("Invalid repeat type");
    }
  }

  return dates;
};
