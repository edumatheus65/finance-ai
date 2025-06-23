import {
  PiggyBankIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import SummaryCards from "./summary-cards";

const SummaryCard = () => {
  return (
    <div className="space-y-6">
      <SummaryCards
        icon={<WalletIcon size={18} />}
        title="Saldo"
        amount={2700}
        size="large"
      />

      <div className="grid grid-cols-3 gap-6">
        <SummaryCards
          icon={<PiggyBankIcon size={16} className="text-blue-600" />}
          title="Investido"
          amount={3500}
          size="small"
        />

        <SummaryCards
          icon={<TrendingUpIcon size={16} className="text-primary" />}
          title="Receita"
          amount={8150}
          size="small"
        />

        <SummaryCards
          icon={<TrendingDownIcon size={16} className="text-red-600" />}
          title="Despesas"
          amount={2950}
          size="small"
        />
      </div>
    </div>
  );
};

export default SummaryCard;
