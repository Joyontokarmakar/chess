import React, { useEffect, useState } from 'react';
import { ToastItem, Theme } from '../types';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimes, FaExclamationCircle, FaBullhorn } from 'react-icons/fa';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
  theme: Theme;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss, theme }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id]);

  const handleDismiss = () => {
    setIsExiting(true);
    // Animation duration is 300ms, call onDismiss after that
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };

  let bgColor = '';
  let borderColor = '';
  let iconColor = '';
  let textColor = '';
  let IconComponent: React.ElementType = FaInfoCircle;

  if (theme === 'dark') {
    textColor = 'text-slate-100';
    switch (toast.type) {
      case 'success':
        bgColor = 'bg-green-600/80 backdrop-blur-md';
        borderColor = 'border-green-500/70';
        iconColor = 'text-green-300';
        IconComponent = FaCheckCircle;
        break;
      case 'error':
        bgColor = 'bg-red-600/80 backdrop-blur-md';
        borderColor = 'border-red-500/70';
        iconColor = 'text-red-300';
        IconComponent = FaExclamationCircle;
        break;
      case 'warning':
        bgColor = 'bg-yellow-500/80 backdrop-blur-md';
        borderColor = 'border-yellow-400/70';
        iconColor = 'text-yellow-200';
        IconComponent = FaExclamationTriangle;
        break;
      case 'check':
        bgColor = 'bg-amber-600/80 backdrop-blur-md';
        borderColor = 'border-amber-500/70';
        iconColor = 'text-amber-200';
        IconComponent = FaBullhorn; // Using FaExclamationTriangle for check as well for visual distinctness
        break;
      case 'info':
      default:
        bgColor = 'bg-sky-600/80 backdrop-blur-md';
        borderColor = 'border-sky-500/70';
        iconColor = 'text-sky-300';
        IconComponent = FaInfoCircle;
        break;
    }
  } else { // Light theme
    textColor = 'text-slate-800';
    switch (toast.type) {
      case 'success':
        bgColor = 'bg-green-500/90 backdrop-blur-md';
        borderColor = 'border-green-600/80';
        iconColor = 'text-white';
        IconComponent = FaCheckCircle;
        break;
      case 'error':
        bgColor = 'bg-red-500/90 backdrop-blur-md';
        borderColor = 'border-red-600/80';
        iconColor = 'text-white';
        IconComponent = FaExclamationCircle;
        break;
      case 'warning':
        bgColor = 'bg-yellow-400/90 backdrop-blur-md';
        borderColor = 'border-yellow-500/80';
        iconColor = 'text-yellow-800';
        IconComponent = FaExclamationTriangle;
        break;
      case 'check':
        bgColor = 'bg-amber-500/90 backdrop-blur-md';
        borderColor = 'border-amber-600/80';
        iconColor = 'text-white';
        IconComponent = FaBullhorn;
        break;
      case 'info':
      default:
        bgColor = 'bg-sky-500/90 backdrop-blur-md';
        borderColor = 'border-sky-600/80';
        iconColor = 'text-white';
        IconComponent = FaInfoCircle;
        break;
    }
  }

  const animationClass = isExiting ? 'toast-exit' : 'toast-enter';

  return (
    <div
      className={`relative flex items-center w-full max-w-sm p-3 my-2 rounded-lg shadow-xl border ${bgColor} ${borderColor} ${animationClass}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={`flex-shrink-0 w-6 h-6 mr-3 ${iconColor}`}>
        <IconComponent className="w-full h-full" />
      </div>
      <div className={`flex-grow text-sm font-medium ${textColor}`}>
        {toast.message}
      </div>
      <button
        onClick={handleDismiss}
        className={`ml-3 p-1 rounded-full focus:outline-none focus:ring-1 ${theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-black/20 focus:ring-slate-400' : 'text-slate-600 hover:text-slate-900 hover:bg-black/10 focus:ring-slate-500'}`}
        aria-label="Dismiss notification"
      >
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  );
};

export default Toast;