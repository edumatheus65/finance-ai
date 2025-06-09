"use server";

import { db } from "@/app/_lib/prisma";
import { redirect } from "next/navigation";

export const deleteTransaction = async (id: string) => {
  try {
    await db.transaction.delete({ where: { id } });
    redirect("/transactions");
  } catch (error) {
    console.error("Erro ao deletar transação", error);
    throw error;
  }
};
