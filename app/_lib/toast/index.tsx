import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export const showSuccessToast = (transactionId?: string) => {
  const message = transactionId
    ? "Transação atualizada com sucesso!"
    : "Transação criada com sucesso!";
  toast.success(message, {
    icon: <CheckCircle2 className="text-green-500" />,
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    icon: <XCircle className="text-red-500" />,
  });
};
