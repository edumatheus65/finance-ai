"use server";

import { TRANSACTION_CATEGORY_LABELS } from "@/app/_constants/transactions";
import { authOptions } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { TransactionCategory, TransactionType } from "@prisma/client";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { generateText, Output, type LanguageModel } from "ai";
import { getServerSession } from "next-auth";
import {
  financialInsightSchema,
  parseFinancialInsightFromModelText,
  type FinancialInsight,
} from "./financial-insight";

export type { FinancialInsight } from "./financial-insight";

export type GenerateAIReportSuccess = {
  success: true;
  data: {
    period: {
      startIso: string;
      endIso: string;
      label: string;
    };
    totals: {
      entradas: number;
      saidas: number;
      saldo: number;
    };
    porCategoria: Array<{
      categoria: string;
      categoriaId: TransactionCategory;
      entradas: number;
      saidas: number;
      saldo: number;
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

/**
 * Groq + Llama 3.3: não usar `Output.object` (json_schema não suportado; json_object não
 * respeita o shape). Geramos texto e validamos com Zod.
 */
async function generateFinancialInsightWithGroq(
  model: LanguageModel,
  contextForModel: unknown,
): Promise<FinancialInsight> {
  const system = `Você é um assistente de finanças pessoais em português do Brasil.
Responda somente com um único objeto JSON. Não use markdown, não adicione texto antes ou depois do JSON.
O objeto deve usar exatamente estas chaves em inglês:
- "headline": string (título curto)
- "summary": string (2 a 4 frases, só com base nos dados)
- "actionableTip": string (uma ação concreta)
- "sentiment": exatamente "positive", "neutral" ou "attention"
- "healthScore": número de 0 a 10
Opcional: "focusArea": string (omitir se não aplicável).`;

  const dataBlock = JSON.stringify(contextForModel, null, 2);

  const { text: first } = await generateText({
    model,
    temperature: 0.35,
    system,
    prompt: `Resumo financeiro do usuário (último mês calendário):\n${dataBlock}\n\nGere o insight no JSON especificado.`,
  });

  let parsed = parseFinancialInsightFromModelText(first);
  if (parsed.success) {
    return parsed.insight;
  }

  const { text: second } = await generateText({
    model,
    temperature: 0.25,
    system,
    prompt: `Resumo financeiro:\n${dataBlock}\n\nA resposta anterior estava incorreta: ${parsed.error}\nResponda de novo com APENAS o JSON com as chaves headline, summary, actionableTip, sentiment, healthScore e opcionalmente focusArea. Não use outras chaves (como "insight").`,
  });

  parsed = parseFinancialInsightFromModelText(second);
  if (!parsed.success) {
    throw new Error(parsed.error);
  }
  return parsed.insight;
}

export const generateAIReport = async (): Promise<GenerateAIReportResult> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
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
      { entradas: number; saidas: number }
    >();

    for (const c of Object.values(TransactionCategory)) {
      categoryBuckets.set(c, { entradas: 0, saidas: 0 });
    }

    let totalEntradas = 0;
    let totalSaidas = 0;

    for (const row of aggregates) {
      const amount = decimalToNumber(row._sum.amount);
      if (row.type === TransactionType.DEPOSIT) {
        totalEntradas += amount;
        const b = categoryBuckets.get(row.category)!;
        b.entradas += amount;
      } else {
        totalSaidas += amount;
        const b = categoryBuckets.get(row.category)!;
        b.saidas += amount;
      }
    }

    const saldoGeral = Math.round((totalEntradas - totalSaidas) * 100) / 100;

    const porCategoria = Object.values(TransactionCategory).map(
      (categoriaId) => {
        const b = categoryBuckets.get(categoriaId)!;
        const saldo = Math.round((b.entradas - b.saidas) * 100) / 100;
        return {
          categoria: TRANSACTION_CATEGORY_LABELS[categoriaId],
          categoriaId,
          entradas: Math.round(b.entradas * 100) / 100,
          saidas: Math.round(b.saidas * 100) / 100,
          saldo,
        };
      },
    );

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
            entradas: 0,
            saidas: 0,
            saldo: 0,
          },
          porCategoria,
          insight: FALLBACK_INSIGHT,
          meta: { model: "fallback" },
        },
      };
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!openaiKey && !groqKey) {
      return {
        success: false,
        error:
          "Defina OPENAI_API_KEY ou GROQ_API_KEY no ambiente para gerar o insight com IA.",
      };
    }

    const contextForModel = {
      periodo: periodPayload.label,
      totais: {
        entradas: totalEntradas,
        saidas: totalSaidas,
        saldo: saldoGeral,
      },
      porCategoria: porCategoria.filter(
        (row) => row.entradas > 0 || row.saidas > 0,
      ),
      notas: [
        "Valores em moeda local; entradas = tipo DEPOSIT; saídas = EXPENSE e INVESTMENT.",
        "Não invente números: use apenas o contexto fornecido.",
      ],
    };

    const useOpenAI = Boolean(openaiKey?.length);

    const model = useOpenAI
      ? {
          id: "gpt-4o-mini" as const,
          instance: createOpenAI({ apiKey: openaiKey! })("gpt-4o-mini"),
        }
      : {
          id: "llama-3.3-70b-versatile" as const,
          instance: createGroq({ apiKey: groqKey! })("llama-3.3-70b-versatile"),
        };

    let insight: FinancialInsight;

    if (useOpenAI) {
      const { output } = await generateText({
        model: model.instance,
        output: Output.object({
          schema: financialInsightSchema,
          name: "FinancialHealthInsight",
          description:
            "Insight curto e acionável sobre saúde financeira com base no resumo fornecido",
        }),
        temperature: 0.35,
        system: `Você é um assistente de finanças pessoais em português do Brasil.
Responda só com o objeto estruturado solicitado (campos exigidos pelo schema).
Seja direto, empático e prático. Não use jargão desnecessário.
Não use markdown nem cercas de código — apenas JSON.`,
        prompt: `Com base no resumo financeiro abaixo (último mês calendário), gere o insight.

${JSON.stringify(contextForModel, null, 2)}`,
      });

      if (!output) {
        return {
          success: false,
          error: "O modelo não retornou um insight estruturado.",
        };
      }
      insight = output;
    } else {
      insight = await generateFinancialInsightWithGroq(
        model.instance,
        contextForModel,
      );
    }

    return {
      success: true,
      data: {
        period: periodPayload,
        totals: {
          entradas: Math.round(totalEntradas * 100) / 100,
          saidas: Math.round(totalSaidas * 100) / 100,
          saldo: saldoGeral,
        },
        porCategoria,
        insight,
        meta: { model: model.id },
      },
    };
  } catch (error) {
    console.error("Erro ao gerar relatório com IA", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro inesperado",
    };
  }
};
