import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import NavBar from "../_components/navbar";
import SummaryCard from "./_components/summary-card";
import TimeSelect from "./_components/time-select";
import { isMatch } from "date-fns";
import TransactionPieChart from "./_components/transactions-pie-chart";
import { getDashboard } from "../data/get-dashboard";
import ExpensesPerCategory from "./_components/expenses-per-category";
import LastTransactions from "./_components/last-transactions";

interface HomeProps {
  searchParams: {
    month: string;
  };
}

const Home = async ({ searchParams: { month } }: HomeProps) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    redirect("/login");
  }

  const monthIsInvalid = !month || !isMatch(month, "MM");

  if (monthIsInvalid) {
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    redirect(`/?month=${currentMonth}`);
  }

  const dashboard = await getDashboard(month, session.user.id);

  return (
    <>
      <NavBar />
      <div className="flex h-full flex-col space-y-4 overflow-hidden p-6">
        {/* Header */}
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <TimeSelect />
        </div>

        {/* Conteúdo Principal */}
        <div className="grid h-full grid-cols-[2fr,1fr] gap-4 overflow-hidden">
          <div className="flex flex-col gap-4 overflow-hidden">
            <SummaryCard month={month} {...dashboard} />

            {/* Gráficos */}
            <div className="grid h-full grid-cols-3 grid-rows-1 gap-4 overflow-hidden">
              <TransactionPieChart {...dashboard} />

              <ExpensesPerCategory
                expensesPerCategory={dashboard.totalExpensePerCategory}
              />
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="grid grid-cols flex-1 min-h-0">
            <LastTransactions lastTransactions={dashboard.lastTransactions} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
