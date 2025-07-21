import AddTransactionButton from "@/app/_components/add-transaction-button";
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card";
import { ReactNode } from "react";

interface SummatyCardsProps {
  icon: ReactNode;
  title: string;
  amount: number;
  size: "small" | "large";
}

const SummaryCards = ({
  icon,
  title,
  amount,
  size = "small",
}: SummatyCardsProps) => {
  const isLarge = size === "large";

  return (
    <Card
      className={`${
        isLarge ? "bg-muted opacity-97 h-[85px] p-3" : "h-[70px] p-2"
      }`}
    >
      <CardHeader className="flex-row items-center gap-2 p-0">
        {icon}
        <p
          className={`${
            isLarge
              ? "text-white opacity-70 text-sm"
              : "text-muted-foreground text-xs"
          }`}
        >
          {title}
        </p>
      </CardHeader>
      <CardContent className="flex justify-between items-end p-0 mt-1">
        <p className={`font-bold ${isLarge ? "text-xl" : "text-lg"}`}>
          {Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount)}
        </p>

        {isLarge && <AddTransactionButton />}
      </CardContent>
    </Card>
  );
};

export default SummaryCards;
