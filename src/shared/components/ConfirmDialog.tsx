import Button from "./Button";
import Dialog from "./Dialog";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title = "Confirm Delete",
  description = "This action cannot be undone.",
  loading,
  onConfirm,
  onCancel
}: Props) {
  return (
    <Dialog open={open} title={title} onClose={onCancel} maxWidth="sm">
      <p className="text-sm leading-6 text-muted">{description}</p>
      <div className="mt-6 flex gap-3">
        <Button
          id="confirm-dialog-confirm"
          onClick={onConfirm}
          loading={!!loading}
          className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white border-none px-4 py-2"
        >
          Delete
        </Button>
        <Button id="confirm-dialog-cancel" onClick={onCancel} variant="secondary" className="px-4 py-2">
          Cancel
        </Button>
      </div>
    </Dialog>
  );
}
