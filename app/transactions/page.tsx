import { DataTable } from "../_components/ui/data-table";
import { db } from "../_lib/prisma";
import { transactionsColumns } from "./_collumns";
import AddTransactionButton from "../_components/add-transaction-button";
import NavBar from "../_components/navbar";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

const TransactionsPage = async () => {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const transactions = JSON.parse(
    JSON.stringify(
      await db.transaction.findMany({
        where: {
          userId,
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
          className="text-sm [&_td]:py-1 [&_td]:px-2 [&_th]:py-2 [&_th]:px-2"
        />
      </div>
    </>
  );
};

export default TransactionsPage;
