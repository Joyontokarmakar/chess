import React from 'react';
import { ToastItem, Theme } from '../types';
import Toast from './Toast';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  theme: Theme;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss, theme }) => {
  return (
    <div
      className="fixed top-4 right-4 z-[100] w-full max-w-sm space-y-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          theme={theme}
        />
      ))}
    </div>
  );
};

export default ToastContainer;