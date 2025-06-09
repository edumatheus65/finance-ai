import DeleteTranactionDialog from "@/app/_components/delete-transaction-dialog";
import { Button } from "@/app/_components/ui/button";
import { Transaction } from "@prisma/client";
import { TrashIcon } from "lucide-react";
import { useState } from "react";

interface DeleteTransactionButton {
  transaction: Transaction;
}

const DeleteTransaction = ({ transaction }: DeleteTransactionButton) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        onClick={() => setDialogIsOpen(true)}
      >
        <TrashIcon />
      </Button>

      <DeleteTranactionDialog
        isOpen={dialogIsOpen}
        setIsOpen={setDialogIsOpen}
        transactionId={transaction.id}
      />
    </>
  );
};

export default DeleteTransaction;
