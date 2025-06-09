import { deleteTransaction } from "../_actions/delete-transaction";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogHeader,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface DeleteTransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  transactionId: string;
}

const DeleteTranactionDialog = ({
  isOpen,
  setIsOpen,
  transactionId,
}: DeleteTransactionDialogProps) => {
  const handleDelete = async () => {
    try {
      await deleteTransaction(transactionId);
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao deletar transação", error);
    }
  };
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja deletar a transação? Essa ação não pode ser
            desfeita!
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTranactionDialog;
