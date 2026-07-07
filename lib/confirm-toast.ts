import { toast } from "sonner";

export function confirmToast(
  message: string,
  onConfirm: () => void | Promise<void>,
  confirmLabel = "Delete"
) {
  toast(message, {
    action: {
      label: confirmLabel,
      onClick: () => {
        void onConfirm();
      },
    },
    cancel: {
      label: "Cancel",
    },
  });
}
