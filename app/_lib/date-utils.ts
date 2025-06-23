import { endOfMonth, startOfMonth } from "date-fns";

export const getMonthDateRange = (
  month: string,
  year = new Date().getUTCFullYear(),
) => {
  const monthIndex = parseInt(month) - 1;

  if (monthIndex < 0 || monthIndex > 11 || isNaN(monthIndex)) {
    throw new Error(`Invalid month: ${month}`);
  }

  const from = startOfMonth(new Date(year, monthIndex));
  const to = endOfMonth(new Date(year, monthIndex));

  return { from, to };
};
