import {
  PiggyBankIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import SummaryCards from "./summary-cards";
import { db } from "@/app/_lib/prisma";
import { getMonthDateRange } from "@/app/_lib/date-utils";

interface SummaryCardProps {
  month: string;
}

const SummaryCard = async ({ month }: SummaryCardProps) => {
  const { from, to } = getMonthDateRange(month);

  const where = {
    date: {
      gte: from,
      lte: to,
    },
  };
  const depositsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: "DEPOSIT" },
        _sum: { amount: true },
      })
    )?._sum?.amount,
  );

  const investimentsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: "INVESTMENT" },
        _sum: { amount: true },
      })
    )?._sum?.amount,
  );

  const expensesTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: "EXPENSE" },
        _sum: { amount: true },
      })
    )?._sum?.amount,
  );

  const totalBalance = depositsTotal - investimentsTotal - expensesTotal;
  return (
    <div className="space-y-6">
      <SummaryCards
        icon={<WalletIcon size={18} />}
        title="Saldo"
        amount={totalBalance}
        size="large"
      />

      <div className="grid grid-cols-3 gap-6">
        <SummaryCards
          icon={<PiggyBankIcon size={16} className="text-blue-600" />}
          title="Investido"
          amount={investimentsTotal}
          size="small"
        />

        <SummaryCards
          icon={<TrendingUpIcon size={16} className="text-primary" />}
          title="Receita"
          amount={depositsTotal}
          size="small"
        />

        <SummaryCards
          icon={<TrendingDownIcon size={16} className="text-red-600" />}
          title="Despesas"
          amount={expensesTotal}
          size="small"
        />
      </div>
    </div>
  );
};

export default SummaryCard;
