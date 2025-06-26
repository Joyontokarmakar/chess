
import { useState, useCallback } from 'react';
import { ToastItem, ToastType, GameStatus } from '../types';

export const useToasts = (showGameToastsSetting: boolean) => {
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
    if (!showGameToastsSetting && type !== 'check') return; 

    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    setActiveToasts(prevToasts => {
      const newToasts = [...prevToasts, { id, message, type, duration }];
      return newToasts.slice(-5); // Keep max 5 toasts
    });
  }, [showGameToastsSetting]);

  const removeToast = useCallback((id: string) => {
    setActiveToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);
  
  const determineToastTypeForGameStatus = useCallback((status: GameStatus): ToastType => {
      if (status.reason === 'checkmate' || status.winner) return 'success';
      if (status.message.toLowerCase().includes('check!')) return 'check';
      if (status.reason === 'stalemate') return 'info';
      if (status.message.toLowerCase().includes('error') || 
          status.message.toLowerCase().includes('could not move') ||
          status.message.toLowerCase().includes('illegal move')) return 'error';
      if (status.message.toLowerCase().includes('thinking')) return 'info';
      if (status.message.toLowerCase().includes('hint') || status.message.toLowerCase().includes('coach')) return 'info';
      return 'info';
  }, []);

  return { activeToasts, addToast, removeToast, determineToastTypeForGameStatus };
};
