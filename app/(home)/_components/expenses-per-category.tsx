import { Progress } from "@/app/_components/ui/progress";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { TRANSACTION_CATEGORY_LABELS } from "@/app/_constants/transactions";
import { TotalExpensePerCategory } from "@/app/data/get-dashboard/types";

interface ExpensesPerCategoryProps {
  expensesPerCategory: TotalExpensePerCategory[];
}

const ExpensesPerCategory = ({
  expensesPerCategory,
}: ExpensesPerCategoryProps) => {
  return (
    <ScrollArea className="col-span-2 rounded-md border p-4 h-full">
      <div className="space-y-3">
        <p className="font-bold text-base">Gastos por Categoria</p>

        {expensesPerCategory.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma despesa cadastrada esse mês
          </p>
        ) : (
          expensesPerCategory.map((category) => (
            <div key={category.category} className="space-y-1.5">
              <div className="flex w-full justify-between text-xs font-semibold">
                <p>{TRANSACTION_CATEGORY_LABELS[category.category]}</p>
                <p>{category.percentageOfTotal}%</p>
              </div>
              <Progress value={category.percentageOfTotal} className="h-2" />
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default ExpensesPerCategory;
