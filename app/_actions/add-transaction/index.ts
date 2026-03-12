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
import { z } from "zod";
import { validateFreePlanTransactionLimit } from "./plan-limit";

interface UpsertTransactionResult {
  success: boolean;
  error: string | null;
}

const upsertTransactionSchema = z.object({
  id: z.string().trim().min(1, "Invalid transaction id").optional(),
  name: z.string().trim().min(1, "O nome é obrigatório"),
  amount: z.coerce
    .number({
      invalid_type_error: "O valor deve ser um número",
    })
    .positive("O valor deve ser positivo"),
  type: z.nativeEnum(TransactionType, {
    errorMap: () => ({ message: "O tipo é obrigatório" }),
  }),
  category: z.nativeEnum(TransactionCategory, {
    errorMap: () => ({ message: "A categoria é obrigatória" }),
  }),
  paymentMethod: z.nativeEnum(TransactionPaymentMethod, {
    errorMap: () => ({ message: "O método de pagamento é obrigatório" }),
  }),
  date: z.coerce.date({
    errorMap: () => ({ message: "A data é obrigatória" }),
  }),
});

type UpsertTransactionParams = z.infer<typeof upsertTransactionSchema>;

export const upsertTransaction = async (
  params: unknown,
): Promise<UpsertTransactionResult> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const parsedParams: UpsertTransactionParams =
      upsertTransactionSchema.parse(params);
    const userId = session.user.id;
    const isPremium = session.user.subscriptionStatus === "active";
    const isUpdate = Boolean(parsedParams.id);

    if (!isUpdate) {
      const planLimitError = await validateFreePlanTransactionLimit({
        date: parsedParams.date,
        isPremium,
        userId,
      });

      if (planLimitError) {
        return {
          success: false,
          error: planLimitError,
        };
      }
    }

    if (isUpdate) {
      const { id, ...transactionData } = parsedParams;
      const updatedTransactions = await db.transaction.updateMany({
        where: {
          id,
          userId,
        },
        data: transactionData,
      });

      if (updatedTransactions.count === 0) {
        return {
          success: false,
          error: "Transaction not found",
        };
      }
    } else {
      await db.transaction.create({
        data: {
          ...parsedParams,
          userId,
        },
      });
    }

    revalidatePath("/transactions");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    console.error("Erro ao salvar transação", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro inesperado",
    };
  }
};
