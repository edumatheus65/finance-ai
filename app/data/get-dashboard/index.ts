import { getMonthDateRange } from "@/app/_lib/date-utils";
import { db } from "@/app/_lib/prisma";
import { TransactionType } from "@prisma/client";
import {
  DashboardData,
  TotalExpensePerCategory,
  TransactionPercentagePerType,
} from "./types";

const EMPTY_DASHBOARD: DashboardData = {
  totalBalance: 0,
  depositsTotal: 0,
  investimentsTotal: 0,
  expensesTotal: 0,
  typesPercentage: {
    [TransactionType.DEPOSIT]: 0,
    [TransactionType.EXPENSE]: 0,
    [TransactionType.INVESTMENT]: 0,
  },
  totalExpensePerCategory: [],
  lastTransactions: [],
};

export const getDashboard = async (
  month: string,
  userId: string,
): Promise<DashboardData> => {
  try {
    const { from, to } = getMonthDateRange(month);

    const where = {
      userId,
      date: { gte: from, lte: to },
    };

    const aggregateSum = (type: TransactionType) =>
      db.transaction.aggregate({
        where: { ...where, type },
        _sum: { amount: true },
      });

    const [depositsAgg, investmentsAgg, expensesAgg, expensesByCategory, lastTransactionsRaw] =
      await Promise.all([
        aggregateSum(TransactionType.DEPOSIT),
        aggregateSum(TransactionType.INVESTMENT),
        aggregateSum(TransactionType.EXPENSE),
        db.transaction.groupBy({
          by: ["category"],
          where: { ...where, type: TransactionType.EXPENSE },
          _sum: { amount: true },
        }),
        db.transaction.findMany({
          where,
          orderBy: { date: "desc" },
          take: 10,
        }),
      ]);

    const depositsTotal = Number(depositsAgg._sum.amount ?? 0);
    const investimentsTotal = Number(investmentsAgg._sum.amount ?? 0);
    const expensesTotal = Number(expensesAgg._sum.amount ?? 0);
    const totalBalance = depositsTotal - investimentsTotal - expensesTotal;

    const transactionTotal = depositsTotal + investimentsTotal + expensesTotal;

    const safeDivide = (numerator: number, denominator: number) =>
      denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);

    const typesPercentage: TransactionPercentagePerType = {
      [TransactionType.DEPOSIT]: safeDivide(depositsTotal, transactionTotal),
      [TransactionType.EXPENSE]: safeDivide(expensesTotal, transactionTotal),
      [TransactionType.INVESTMENT]: safeDivide(investimentsTotal, transactionTotal),
    };

    const totalExpensePerCategory: TotalExpensePerCategory[] =
      expensesByCategory.map((category) => ({
        category: category.category,
        totalAmount: Number(category._sum.amount ?? 0),
        percentageOfTotal: safeDivide(
          Number(category._sum.amount ?? 0),
          expensesTotal,
        ),
      }));

    const lastTransactions = lastTransactionsRaw.map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));

    return {
      totalBalance,
      depositsTotal,
      investimentsTotal,
      expensesTotal,
      typesPercentage,
      totalExpensePerCategory,
      lastTransactions,
    };
  } catch (error) {
    console.error("[getDashboard] Failed to fetch dashboard data:", error);
    return EMPTY_DASHBOARD;
  }
};
