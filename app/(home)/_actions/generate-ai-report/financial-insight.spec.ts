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

  it("aceita JSON puro", () => {
    const r = parseFinancialInsightFromModelText(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.insight.headline).toBe("Título");
      expect(r.insight.healthScore).toBe(6);
    }
  });

  it("aceita JSON dentro de fence markdown", () => {
    const r = parseFinancialInsightFromModelText("```json\n" + valid + "\n```");
    expect(r.success).toBe(true);
  });

  it("rejeita formato errado (ex.: só chave insight, como Llama json_object)", () => {
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

  it("rejeita sentiment inválido", () => {
    const r = parseFinancialInsightFromModelText(
      '{"headline":"a","summary":"b","actionableTip":"c","sentiment":"ok","healthScore":5}',
    );
    expect(r.success).toBe(false);
  });
});
