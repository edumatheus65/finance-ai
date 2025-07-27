import { DataTable } from "../_components/ui/data-table";
import { db } from "../_lib/prisma";
import { transactionsColumns } from "./_collumns";
import AddTransactionButton from "../_components/add-transaction-button";
import NavBar from "../_components/navbar";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

const TransactionsPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    redirect("/login");
  }

  const transactions = JSON.parse(
    JSON.stringify(
      await db.transaction.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ),
  );

  return (
    <>
      <NavBar />
      <div className="p-6 space-y-6">
        {/* Titulo do Botão */}
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Transações</h1>

          <AddTransactionButton />
        </div>
        <DataTable
          columns={transactionsColumns}
          data={transactions}
          pageSize={5}
        />
      </div>
    </>
  );
};

export default TransactionsPage;
