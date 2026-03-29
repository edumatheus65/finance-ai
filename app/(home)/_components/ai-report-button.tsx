"use client";

import {
  generateAIReport,
  type GenerateAIReportSuccess,
} from "@/app/(home)/_actions/generate-ai-report";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { showErrorToast } from "@/app/_lib/toast";
import { formatCurrency } from "@/app/_utils/currency";
import { BotIcon, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const AIReportButton = () => {
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<GenerateAIReportSuccess["data"] | null>(
    null,
  );

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateAIReport();
      if (result.success) {
        setReport(result.data);
        toast.success("Relatório gerado com base no mês anterior.");
      } else {
        setReport(null);
        showErrorToast(result.error);
      }
    });
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setReport(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" className="font-bold">
          Relatório AI
          <BotIcon className="ml-1 size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Relatório AI</DialogTitle>
          <DialogDescription>
            Gera um insight sobre o <strong>último mês calendário</strong>{" "}
            (entradas, saídas e saldo por categoria), usando seus dados
            cadastrados.
          </DialogDescription>
        </DialogHeader>

        {report ? (
          <div className="space-y-4 text-sm">
            <div className="rounded-md border bg-muted/40 px-3 py-2">
              <p className="text-xs text-muted-foreground">Período analisado</p>
              <p className="font-medium capitalize">{report.period.label}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md border p-2">
                <p className="text-muted-foreground">Entradas</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(report.totals.entradas)}
                </p>
              </div>
              <div className="rounded-md border p-2">
                <p className="text-muted-foreground">Saídas</p>
                <p className="font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(report.totals.saidas)}
                </p>
              </div>
              <div className="rounded-md border p-2">
                <p className="text-muted-foreground">Saldo</p>
                <p className="font-semibold">
                  {formatCurrency(report.totals.saldo)}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Insight ({report.meta.model})
              </p>
              <h3 className="text-base font-semibold leading-snug">
                {report.insight.headline}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {report.insight.summary}
              </p>
              <p className="mt-3 rounded-md bg-primary/10 px-3 py-2 text-foreground">
                <span className="font-medium">Dica: </span>
                {report.insight.actionableTip}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Saúde financeira (0–10):{" "}
                <span className="font-medium text-foreground">
                  {report.insight.healthScore}
                </span>
                {report.insight.focusArea ? (
                  <> · Foco: {report.insight.focusArea}</>
                ) : null}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Clique em &quot;Gerar relatório&quot; para buscar o resumo do último
            mês e pedir um insight à IA.
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="ghost" type="button">
              Fechar
            </Button>
          </DialogClose>
          <Button type="button" disabled={isPending} onClick={handleGenerate}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Gerando…
              </>
            ) : (
              "Gerar relatório"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIReportButton;
