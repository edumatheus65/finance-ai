import { z } from "zod";

export const financialInsightSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  actionableTip: z.string(),
  sentiment: z.enum(["positive", "neutral", "attention"]),
  healthScore: z.number().min(0).max(10),
  focusArea: z.string().optional(),
});

export type FinancialInsight = z.infer<typeof financialInsightSchema>;

export type ParseFinancialInsightResult =
  | { success: true; insight: FinancialInsight }
  | { success: false; error: string };

function stripMarkdownFence(text: string): string {
  const t = text.trim();
  const block = /^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```$/im.exec(t);
  if (block) {
    return block[1].trim();
  }
  return t;
}

function extractFirstJsonObject(text: string): string {
  const t = stripMarkdownFence(text);
  const start = t.indexOf("{");
  if (start === -1) {
    throw new Error("No '{' found in model response.");
  }
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < t.length; i++) {
    const ch = t[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return t.slice(start, i + 1);
      }
    }
  }
  throw new Error("Incomplete JSON or unbalanced braces.");
}

export function parseFinancialInsightFromModelText(
  text: string,
): ParseFinancialInsightResult {
  try {
    const jsonStr = extractFirstJsonObject(text);
    const raw: unknown = JSON.parse(jsonStr);
    const parsed = financialInsightSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: `Invalid JSON for schema: ${parsed.error.message}`,
      };
    }
    return { success: true, insight: parsed.data };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to parse JSON.",
    };
  }
}
