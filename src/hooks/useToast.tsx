import { useState, useCallback, useEffect } from 'react';
import { ToastData } from '../components/UI/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'> & { _fromEvent?: boolean } ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const data = { ...toast, id } as ToastData & { _fromEvent?: boolean };
    setToasts(prev => [...prev, data]);

    // Dispatch global event for app-level listener, avoid loops
    if (!toast._fromEvent && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:add-toast', { detail: data }));
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as ToastData;
      if (detail && detail.id) {
        // Mark as from event to avoid redispatch
        addToast({ type: detail.type, title: detail.title, message: detail.message, _fromEvent: true } as any);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('app:add-toast', handler as any);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('app:add-toast', handler as any);
      }
    };
  }, [addToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
  };
};