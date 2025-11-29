/**
 * ConfirmDialog - Confirmation dialog for critical actions
 */

"use client";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "info",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      button: "bg-red-600 hover:bg-red-700",
      icon: "⚠",
      iconBg: "bg-red-100 text-red-600",
    },
    warning: {
      button: "bg-yellow-600 hover:bg-yellow-700",
      icon: "⚠",
      iconBg: "bg-yellow-100 text-yellow-600",
    },
    info: {
      button: "bg-blue-600 hover:bg-blue-700",
      icon: "ℹ",
      iconBg: "bg-blue-100 text-blue-600",
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="animate-in fade-in zoom-in w-full max-w-md rounded-xl bg-white p-6 shadow-2xl duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div className="flex items-start gap-4">
          <div
            className={`${style.iconBg} flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl`}
          >
            {style.icon}
          </div>
          <div className="flex-1">
            <h3
              id="dialog-title"
              className="mb-2 text-lg font-semibold text-gray-900"
            >
              {title}
            </h3>
            <p id="dialog-description" className="text-sm text-gray-600">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 ${style.button} rounded-lg font-medium text-white transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
