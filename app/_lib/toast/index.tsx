import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

type TransactionToastAction = "create" | "update" | "delete";

const transactionSuccessMessages: Record<TransactionToastAction, string> = {
  create: "Transação criada com sucesso!",
  update: "Transação atualizada com sucesso!",
  delete: "Transação excluída com sucesso!",
};

const transactionErrorMessages: Record<TransactionToastAction, string> = {
  create: "Ocorreu um erro ao criar a transação.",
  update: "Ocorreu um erro ao atualizar a transação.",
  delete: "Ocorreu um erro ao deletar a transação.",
};

const showBaseSuccessToast = (message: string) => {
  toast.success(message, {
    icon: <CheckCircle2 className="text-green-500" />,
  });
};

const showBaseErrorToast = (message: string) => {
  toast.error(message, {
    icon: <XCircle className="text-red-500" />,
  });
};

export const showTransactionSuccessToast = (action: TransactionToastAction) => {
  showBaseSuccessToast(transactionSuccessMessages[action]);
};

export const showTransactionErrorToast = (
  action: TransactionToastAction,
  message?: string | null,
) => {
  showBaseErrorToast(message ?? transactionErrorMessages[action]);
};

export const showSuccessToast = (transactionId?: string) => {
  showTransactionSuccessToast(transactionId ? "update" : "create");
};

export const showErrorToast = (message: string) => {
  showBaseErrorToast(message);
};
