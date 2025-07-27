"use client";

import { Transaction } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import TransactionTypeBadge from "../_components/type-badge";
import {
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_PAYMENT_METHOD_LABELS,
} from "@/app/_constants/transactions";
import EditTransactionButton from "../_components/edit-transactions";
import DeleteTransaction from "../_components/delete-transaction";

export const transactionsColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "name",
    header: () => <span className="text-sm font-semibold">Nome</span>,
    cell: ({ row: { original: transaction } }) => (
      <span className="text-sm">{transaction.name}</span>
    ),
  },
  {
    accessorKey: "type",
    header: () => <span className="text-sm text font-semibold">Tipo</span>,
    cell: ({ row: { original: transaction } }) => (
      <TransactionTypeBadge transaction={transaction} />
    ),
  },
  {
    accessorKey: "category",
    header: () => <span className="text-sm font-semibold">Categoria</span>,
    cell: ({ row: { original: transaction } }) => (
      <span className="text-sm">
        {TRANSACTION_CATEGORY_LABELS[transaction.category] || "Sem Categoria"}
      </span>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: () => (
      <span className="text-sm font-semibold">Método de Pagamento</span>
    ),
    cell: ({ row: { original: transaction } }) => (
      <span className="text-sm">
        {TRANSACTION_PAYMENT_METHOD_LABELS[transaction.paymentMethod] ||
          "Sem Método de Pagamento"}
      </span>
    ),
  },
  {
    accessorKey: "date",
    header: () => <span className="text-sm font-semibold">Data</span>,
    cell: ({ row: { original: transaction } }) => (
      <span className="text-sm">
        {new Date(transaction.date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <span className="text-sm font-semibold">Valor</span>,
    cell: ({ row: { original: transaction } }) => (
      <span className="text-sm font-bold">
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(transaction.amount))}
      </span>
    ),
  },
  {
    accessorKey: "actions",
    cell: ({ row: { original: transaction } }) => {
      return (
        <div className="space-x-1">
          <EditTransactionButton transaction={transaction} />
          <DeleteTransaction transaction={transaction} />
        </div>
      );
    },
  },
];
