import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output, type LanguageModel } from "ai";
import {
  financialInsightSchema,
  parseFinancialInsightFromModelText,
  type FinancialInsight,
} from "./financial-insight";
import type { AiInsightContextPayload } from "./insight-payload";

export const INSIGHT_MODEL_IDS = {
  openai: "gpt-4o-mini",
  groq: "llama-3.3-70b-versatile",
} as const;

export type ResolvedInsightLlm =
  | {
      provider: "openai";
      modelId: typeof INSIGHT_MODEL_IDS.openai;
      model: LanguageModel;
    }
  | {
      provider: "groq";
      modelId: typeof INSIGHT_MODEL_IDS.groq;
      model: LanguageModel;
    };

const LLM_TIMEOUT_MS = 60_000;

export function resolveInsightLlm(
  openaiKey: string | undefined,
  groqKey: string | undefined,
): ResolvedInsightLlm | null {
  if (openaiKey?.length) {
    return {
      provider: "openai",
      modelId: INSIGHT_MODEL_IDS.openai,
      model: createOpenAI({ apiKey: openaiKey })(INSIGHT_MODEL_IDS.openai),
    };
  }
  if (groqKey?.length) {
    return {
      provider: "groq",
      modelId: INSIGHT_MODEL_IDS.groq,
      model: createGroq({ apiKey: groqKey })(INSIGHT_MODEL_IDS.groq),
    };
  }
  return null;
}

async function generateWithGroq(
  model: LanguageModel,
  context: AiInsightContextPayload,
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

  const dataBlock = JSON.stringify(context, null, 2);

  const { text: first } = await generateText({
    model,
    temperature: 0.35,
    system,
    timeout: LLM_TIMEOUT_MS,
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
    timeout: LLM_TIMEOUT_MS,
    prompt: `Resumo financeiro:\n${dataBlock}\n\nA resposta anterior estava incorreta: ${parsed.error}\nResponda de novo com APENAS o JSON com as chaves headline, summary, actionableTip, sentiment, healthScore e opcionalmente focusArea. Não use outras chaves (como "insight").`,
  });

  parsed = parseFinancialInsightFromModelText(second);
  if (!parsed.success) {
    throw new Error(parsed.error);
  }
  return parsed.insight;
}

async function generateWithOpenAI(
  model: LanguageModel,
  context: AiInsightContextPayload,
): Promise<FinancialInsight> {
  const { output } = await generateText({
    model,
    output: Output.object({
      schema: financialInsightSchema,
      name: "FinancialHealthInsight",
      description:
        "Short, actionable personal finance insight based on the provided summary",
    }),
    temperature: 0.35,
    timeout: LLM_TIMEOUT_MS,
    system: `Você é um assistente de finanças pessoais em português do Brasil.
Responda só com o objeto estruturado solicitado (campos exigidos pelo schema).
Seja direto, empático e prático. Não use jargão desnecessário.
Não use markdown nem cercas de código — apenas JSON.`,
    prompt: `Com base no resumo financeiro abaixo (último mês calendário), gere o insight.

${JSON.stringify(context, null, 2)}`,
  });

  if (!output) {
    throw new Error("MODEL_NO_STRUCTURED_OUTPUT");
  }
  return output;
}

export async function generateFinancialInsightWithLlm(
  resolved: ResolvedInsightLlm,
  context: AiInsightContextPayload,
): Promise<FinancialInsight> {
  if (resolved.provider === "openai") {
    return generateWithOpenAI(resolved.model, context);
  }
  return generateWithGroq(resolved.model, context);
}
