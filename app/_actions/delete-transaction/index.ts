"use server";

import { db } from "@/app/_lib/prisma";
import { authOptions } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

interface DeleteTransactionResult {
  success: boolean;
  error: string | null;
}

export const deleteTransaction = async (
  id: string,
): Promise<DeleteTransactionResult> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const transactionId = id.trim();

  if (!transactionId) {
    return {
      success: false,
      error: "Invalid transaction id",
    };
  }

  const deletedTransactions = await db.transaction.deleteMany({
    where: {
      id: transactionId,
      userId: session.user.id,
    },
  });

  if (deletedTransactions.count === 0) {
    return {
      success: false,
      error: "Transaction not found",
    };
  }

  revalidatePath("/transactions");

  return {
    success: true,
    error: null,
  };
};
