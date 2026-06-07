/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getButtonClass = () => {
    switch (variant) {
      case 'danger':
        return 'bg-danger hover:bg-danger/90 shadow-lg shadow-danger/20 text-white';
      case 'warning':
        return 'bg-warning hover:bg-warning/90 shadow-lg shadow-warning/20 text-white';
      default:
        return 'bg-brand-primary hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 text-white';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-4 rounded-xl bg-dark-bg p-4 border border-dark-border">
          <div className={`rounded-lg p-2.5 shrink-0 ${
            variant === 'danger' ? 'bg-danger/10 text-danger' :
            variant === 'warning' ? 'bg-warning/10 text-warning' : 'bg-brand-primary/10 text-brand-primary'
          }`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border/40 font-semibold">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-dark-border bg-dark-bg/40 px-4 py-2.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`rounded-xl px-5 py-2.5 text-xs transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${getButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
