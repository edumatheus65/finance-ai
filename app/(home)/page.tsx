import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import LogoutButton from "../_components/LogoutButton";
import GoToTransactionButton from "../_components/go-to-transactions-button";
import { redirect } from "next/navigation";
import NavBar from "../_components/navbar";
import SummaryCard from "./_components/summary-card";
import TimeSelect from "./_components/time-select";
import { isMatch } from "date-fns";

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

  return (
    <>
      <NavBar />
      <div className="p-6 space-y-6">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <TimeSelect />
        </div>
        <SummaryCard month={month} />
      </div>

      <div className="p-4 space-y-4 justify-between">
        OLá, {session?.user?.name}
        <LogoutButton />
        <GoToTransactionButton />
      </div>
    </>
  );
};

export default Home;
