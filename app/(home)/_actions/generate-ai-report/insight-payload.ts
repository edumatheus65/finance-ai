export type AiInsightCategoryRow = {
  category: string;
  income: number;
  expenses: number;
  balance: number;
};

export type AiInsightContextPayload = {
  periodLabel: string;
  totals: {
    income: number;
    expenses: number;
    balance: number;
  };
  byCategory: AiInsightCategoryRow[];
  notes: string[];
};

export function buildAiInsightContextPayload(input: {
  periodLabel: string;
  totalIncome: number;
  totalExpenses: number;
  overallBalance: number;
  categoriesWithMovement: AiInsightCategoryRow[];
}): AiInsightContextPayload {
  return {
    periodLabel: input.periodLabel,
    totals: {
      income: input.totalIncome,
      expenses: input.totalExpenses,
      balance: input.overallBalance,
    },
    byCategory: input.categoriesWithMovement,
    notes: [
      "Values in local currency; income = DEPOSIT; outflows = EXPENSE and INVESTMENT.",
      "Do not invent figures; use only the provided context.",
    ],
  };
}
