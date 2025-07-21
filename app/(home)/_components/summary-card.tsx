import {
  PiggyBankIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import SummaryCards from "./summary-cards";

interface SummaryCardProps {
  month: string;
  totalBalance: number;
  depositsTotal: number;
  investimentsTotal: number;
  expensesTotal: number;
}

const SummaryCard = async ({
  totalBalance,
  depositsTotal,
  investimentsTotal,
  expensesTotal,
}: SummaryCardProps) => {
  return (
    <div className="space-y-4">
      {/* Card Grande */}
      <SummaryCards
        icon={<WalletIcon size={20} />}
        title="Saldo"
        amount={totalBalance}
        size="large"
      />

      {/* Cards Pequenos */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCards
          icon={<PiggyBankIcon size={18} className="text-blue-600" />}
          title="Investido"
          amount={investimentsTotal}
          size="small"
        />

        <SummaryCards
          icon={<TrendingUpIcon size={18} className="text-primary" />}
          title="Receita"
          amount={depositsTotal}
          size="small"
        />

        <SummaryCards
          icon={<TrendingDownIcon size={18} className="text-red-600" />}
          title="Despesas"
          amount={expensesTotal}
          size="small"
        />
      </div>
    </div>
  );
};

export default SummaryCard;
