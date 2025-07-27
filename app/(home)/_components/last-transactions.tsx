import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import Link from "next/link";
import { Transaction, TransactionType } from "@prisma/client";
import Image from "next/image";
import { TRANSACTION_PAYMENT_METHOD_ICONS } from "@/app/_constants/transactions";
import { formatCurrency } from "@/app/_utils/currency";
import { Search } from "lucide-react";

interface LastTransactionsProps {
  lastTransactions: Transaction[];
}

const LastTransactions = ({ lastTransactions }: LastTransactionsProps) => {
  const getAmountColor = (type: TransactionType) => {
    const colors = {
      [TransactionType.DEPOSIT]: "text-primary",
      [TransactionType.EXPENSE]: "text-red-600",
      [TransactionType.INVESTMENT]: "text-blue-600",
    };
    return colors[type] || "text-muted-foreground";
  };

  const getAmountPrefix = (type: TransactionType) => {
    return type === TransactionType.DEPOSIT ? "+" : "-";
  };

  return (
    <Card className="flex flex-col rounded-md border">
      {/* Header fixo */}
      <CardHeader className="flex-row items-center justify-between w-full pb-3 border-b">
        <CardTitle className="font-bold text-lg">Últimas Transações</CardTitle>
        <Button
          variant="outline"
          className="rounded-full font-bold text-sm px-3 p-y-1.5"
          asChild
        >
          <Link href="/transactions">Ver mais</Link>
        </Button>
      </CardHeader>

      {/* Lista com scroll */}
      {lastTransactions.length === 0 ? (
        <div className="flex flex-1 items-center justify-center min-h-[150px] space-x-2">
          <Search className="w-8 h-8" />
          <p className="text-sm text-muted-foreground">
            Nehuma transação registrada
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1 px-0">
          <CardContent className="space-y-4 py-4">
            {lastTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between w-full"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Image
                    src={`${TRANSACTION_PAYMENT_METHOD_ICONS[transaction.paymentMethod ?? "OTHER"]}`}
                    height={16}
                    width={16}
                    alt={transaction.paymentMethod ?? "Método"}
                  />
                </div>

                <div className="flex flex-col justify-center ml-4 w-auto min-w-0">
                  <p className="text-xs font-bold truncate">
                    {transaction.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="ml-auto">
                  <p
                    className={`text-xs font-bold ${getAmountColor(transaction.type)}`}
                  >
                    {getAmountPrefix(transaction.type)}
                    {formatCurrency(Number(transaction.amount))}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </ScrollArea>
      )}
    </Card>
  );
};

export default LastTransactions;
