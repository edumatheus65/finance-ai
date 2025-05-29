import { DataTable } from "../_components/ui/data-table";
import { db } from "../_lib/prisma";
import { transactionsColumns } from "./_collumns";
import AddTransactionButton from "../_components/add-transaction-button";

const TransactionsPage = async () => {
  const transactions = await db.transaction.findMany({});
  return (
    <div className="p-6 space-y-6">
      {/* Titulo do Botão */}
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Transações</h1>

        <AddTransactionButton />
      </div>
      <DataTable columns={transactionsColumns} data={transactions} />
    </div>
  );
};

export default TransactionsPage;
