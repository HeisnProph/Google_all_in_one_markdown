import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="confirm-dialog-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
    >
      <div
        id="confirm-dialog-modal"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isDestructive ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>
          <button
            id="btn-dialog-close"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 rounded-lg p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            id="btn-dialog-cancel"
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            id="btn-dialog-confirm"
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
