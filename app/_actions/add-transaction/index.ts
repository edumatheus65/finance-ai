"use server";

import { db } from "@/app/_lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

interface AddTransactionParams {
  name: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  paymentMethod: TransactionPaymentMethod;
  date: Date;
}

export const addTransaction = async (params: AddTransactionParams) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    throw new Error("User not authenticated");
  }

  await db.transaction.create({
    data: {
      ...params,
      user: {
        connect: { id: session.user.id },
      },
    },
  });

  revalidatePath("/transactions");
};
