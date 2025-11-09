/**
 * ConfirmDialog - Confirmation dialog for critical actions
 *
 * Requirements: 11.3
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div className="flex items-start gap-4">
          <div
            className={`${style.iconBg} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-2xl`}
          >
            {style.icon}
          </div>
          <div className="flex-1">
            <h3
              id="dialog-title"
              className="text-lg font-semibold text-gray-900 mb-2"
            >
              {title}
            </h3>
            <p id="dialog-description" className="text-sm text-gray-600">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 ${style.button} text-white rounded-lg transition-colors font-medium`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
