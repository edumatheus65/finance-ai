import { describe, expect, it } from "vitest";
import { parseFinancialInsightFromModelText } from "./financial-insight";

describe("parseFinancialInsightFromModelText", () => {
  const valid = `{
  "headline": "Título",
  "summary": "Resumo em duas frases aqui.",
  "actionableTip": "Faça algo útil.",
  "sentiment": "neutral",
  "healthScore": 6,
  "focusArea": "Alimentação"
}`;

  it("accepts raw JSON", () => {
    const r = parseFinancialInsightFromModelText(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.insight.headline).toBe("Título");
      expect(r.insight.healthScore).toBe(6);
    }
  });

  it("accepts JSON inside a markdown fence", () => {
    const r = parseFinancialInsightFromModelText("```json\n" + valid + "\n```");
    expect(r.success).toBe(true);
  });

  it("rejects wrong shape (e.g. only insight key, as in some Llama outputs)", () => {
    const r = parseFinancialInsightFromModelText(
      JSON.stringify({
        insight:
          "No mês houve apenas saídas, totalizando R$ 150,00 em Alimentação.",
      }),
    );
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error).toMatch(/invalid|schema|headline/i);
    }
  });

  it("rejects invalid sentiment", () => {
    const r = parseFinancialInsightFromModelText(
      '{"headline":"a","summary":"b","actionableTip":"c","sentiment":"ok","healthScore":5}',
    );
    expect(r.success).toBe(false);
  });
});
