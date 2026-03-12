import { db } from "@/app/_lib/prisma";
import { getMonthDateRange } from "@/app/_lib/date-utils";

export const FREE_MONTHLY_TRANSACTION_LIMIT = 10;

interface ValidateFreePlanTransactionLimitParams {
  date: Date;
  isPremium: boolean;
  userId: string;
}

export const validateFreePlanTransactionLimit = async ({
  date,
  isPremium,
  userId,
}: ValidateFreePlanTransactionLimitParams) => {
  if (isPremium) {
    return null;
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const { from, to } = getMonthDateRange(month, year);

  const currentMonthTransactionsCount = await db.transaction.count({
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
  });

  if (currentMonthTransactionsCount >= FREE_MONTHLY_TRANSACTION_LIMIT) {
    return `Você atingiu o limite de ${FREE_MONTHLY_TRANSACTION_LIMIT} transações para o plano gratuito neste mês.`;
  }

  return null;
};
