import { Button } from "@/app/_components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import Link from "next/link";
import { Transaction, TransactionType } from "@prisma/client";
import Image from "next/image";
import { TRANSACTION_PAYMENT_METHOD_ICONS } from "@/app/_constants/transactions";

interface LastTransactionsProps {
  lastTransactions: Transaction[];
}

const LastTransactions = ({ lastTransactions }: LastTransactionsProps) => {
  const getPriceColor = (transaction: Transaction) => {
    if (transaction.type === TransactionType.EXPENSE) {
      return "text-red-600";
    }
    if (transaction.type === TransactionType.DEPOSIT) {
      return "text-primary";
    }
    if (transaction.type === TransactionType.INVESTMENT) {
      return "text-blue-600";
    }
  };
  return (
    <ScrollArea className="rounded-md border">
      <CardHeader className="flex-row items-center justify-between w-full">
        <CardTitle className="font-bold">Últimas Transações</CardTitle>
        <Button variant="outline" className="rounded-full font-bold" asChild>
          <Link href="/transactions">Ver mais</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between w-full"
          >
            {/* ICONE */}
            <div className="w-10 h-10 rounded-[10.67px] bg-muted flex items-center justify-center">
              <Image
                src={`${TRANSACTION_PAYMENT_METHOD_ICONS[transaction.paymentMethod ?? "OTHER"]}`}
                height={20}
                width={20}
                alt="PIX"
              />
            </div>

            {/* Nome & data */}
            <div className="flex flex-col justify-center ml-4 w-auto">
              <p className="text-sm font-bold truncate">{transaction.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(transaction.date).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Valor */}
            <div className="ml-auto">
              <p className={`text-sm font-bold ${getPriceColor(transaction)}`}>
                R$ {Number(transaction.amount).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </ScrollArea>
  );
};

export default LastTransactions;
