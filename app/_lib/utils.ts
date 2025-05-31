import { Transaction } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const serializeTransactions = (transactions: Transaction[]) => {
  return transactions.map((transaction) => ({
    ...transaction,
    amount: transaction.amount.toNumber(),
  }));
};
