"use server";

import { TRANSACTION_CATEGORY_LABELS } from "@/app/_constants/transactions";
import { authOptions } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import { TransactionCategory, TransactionType } from "@prisma/client";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getServerSession } from "next-auth";
import type { FinancialInsight } from "./financial-insight";
import {
  generateFinancialInsightWithLlm,
  resolveInsightLlm,
} from "./insight-llm";
import { buildAiInsightContextPayload } from "./insight-payload";

export type { FinancialInsight } from "./financial-insight";

const CLIENT_SAFE_INSIGHT_ERROR =
  "Não foi possível gerar o insight. Tente novamente em instantes.";

export type GenerateAIReportSuccess = {
  success: true;
  data: {
    period: {
      startIso: string;
      endIso: string;
      label: string;
    };
    totals: {
      income: number;
      expenses: number;
      balance: number;
    };
    byCategory: Array<{
      category: string;
      categoryId: TransactionCategory;
      income: number;
      expenses: number;
      balance: number;
    }>;
    insight: FinancialInsight;
    meta: {
      model: "gpt-4o-mini" | "llama-3.3-70b-versatile" | "fallback";
    };
  };
};

export type GenerateAIReportFailure = {
  success: false;
  error: string;
};

export type GenerateAIReportResult =
  | GenerateAIReportSuccess
  | GenerateAIReportFailure;

function decimalToNumber(
  value: { toString(): string } | null | undefined,
): number {
  if (value == null) return 0;
  const n = Number(value.toString());
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function getLastMonthRange() {
  const ref = subMonths(new Date(), 1);
  const periodStart = startOfMonth(ref);
  const periodEnd = endOfMonth(ref);
  return { periodStart, periodEnd };
}

const FALLBACK_INSIGHT: FinancialInsight = {
  headline: "Sem movimentação no último mês",
  summary:
    "Não há transações registradas nesse período. Sem dados, não dá para avaliar padrões de gasto ou poupança.",
  actionableTip:
    "Cadastre entradas e saídas do mês para receber insights personalizados na próxima vez.",
  sentiment: "neutral",
  healthScore: 5,
};

export const generateAIReport = async (): Promise<GenerateAIReportResult> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado." };
    }

    const userId = session.user.id;
    const { periodStart, periodEnd } = getLastMonthRange();

    const aggregates = await db.transaction.groupBy({
      by: ["category", "type"],
      where: {
        userId,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      _sum: { amount: true },
    });

    const categoryBuckets = new Map<
      TransactionCategory,
      { income: number; expenses: number }
    >();

    for (const c of Object.values(TransactionCategory)) {
      categoryBuckets.set(c, { income: 0, expenses: 0 });
    }

    let totalIncome = 0;
    let totalExpenses = 0;

    for (const row of aggregates) {
      const amount = decimalToNumber(row._sum.amount);
      if (row.type === TransactionType.DEPOSIT) {
        totalIncome += amount;
        const b = categoryBuckets.get(row.category)!;
        b.income += amount;
      } else {
        totalExpenses += amount;
        const b = categoryBuckets.get(row.category)!;
        b.expenses += amount;
      }
    }

    const overallBalance =
      Math.round((totalIncome - totalExpenses) * 100) / 100;

    const byCategory = Object.values(TransactionCategory).map((categoryId) => {
      const b = categoryBuckets.get(categoryId)!;
      const balance = Math.round((b.income - b.expenses) * 100) / 100;
      return {
        category: TRANSACTION_CATEGORY_LABELS[categoryId],
        categoryId,
        income: Math.round(b.income * 100) / 100,
        expenses: Math.round(b.expenses * 100) / 100,
        balance,
      };
    });

    const periodPayload = {
      startIso: periodStart.toISOString(),
      endIso: periodEnd.toISOString(),
      label: format(periodStart, "MMMM 'de' yyyy", { locale: ptBR }),
    };

    const hasMovement = aggregates.length > 0;

    if (!hasMovement) {
      return {
        success: true,
        data: {
          period: periodPayload,
          totals: {
            income: 0,
            expenses: 0,
            balance: 0,
          },
          byCategory,
          insight: FALLBACK_INSIGHT,
          meta: { model: "fallback" },
        },
      };
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    const resolved = resolveInsightLlm(openaiKey, groqKey);
    if (!resolved) {
      return {
        success: false,
        error:
          "Defina OPENAI_API_KEY ou GROQ_API_KEY no ambiente para gerar o insight com IA.",
      };
    }

    const categoriesWithMovement = byCategory
      .filter((row) => row.income > 0 || row.expenses > 0)
      .map((row) => ({
        category: row.category,
        income: row.income,
        expenses: row.expenses,
        balance: row.balance,
      }));

    const contextPayload = buildAiInsightContextPayload({
      periodLabel: periodPayload.label,
      totalIncome,
      totalExpenses,
      overallBalance,
      categoriesWithMovement,
    });

    const insight = await generateFinancialInsightWithLlm(
      resolved,
      contextPayload,
    );

    return {
      success: true,
      data: {
        period: periodPayload,
        totals: {
          income: Math.round(totalIncome * 100) / 100,
          expenses: Math.round(totalExpenses * 100) / 100,
          balance: overallBalance,
        },
        byCategory,
        insight,
        meta: { model: resolved.modelId },
      },
    };
  } catch {
    return {
      success: false,
      error: CLIENT_SAFE_INSIGHT_ERROR,
    };
  }
};
