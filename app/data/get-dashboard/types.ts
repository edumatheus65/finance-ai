import {
  Transaction,
  TransactionCategory,
  TransactionType,
} from "@prisma/client";

export type TransactionPercentagePerType = {
  [key in TransactionType]: number;
};

export type TotalExpensePerCategory = {
  category: TransactionCategory;
  totalAmount: number;
  percentageOfTotal: number;
};

export interface SerializedTransaction
  extends Omit<Transaction, "amount" | "date" | "createdAt" | "updatedAt"> {
  amount: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardData {
  totalBalance: number;
  depositsTotal: number;
  investimentsTotal: number;
  expensesTotal: number;
  typesPercentage: TransactionPercentagePerType;
  totalExpensePerCategory: TotalExpensePerCategory[];
  lastTransactions: SerializedTransaction[];
}
