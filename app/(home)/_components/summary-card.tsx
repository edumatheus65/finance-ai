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
