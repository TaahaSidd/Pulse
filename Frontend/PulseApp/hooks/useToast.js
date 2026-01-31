import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback(({ type, title, message, duration = 3000, position = 'top' }) => {
    setToast({
      type,
      title,
      message,
      duration,
      position,
      id: Date.now(),
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showSuccess = useCallback((title, message, duration) => {
    showToast({ type: 'success', title, message, duration });
  }, [showToast]);

  const showError = useCallback((title, message, duration) => {
    showToast({ type: 'error', title, message, duration });
  }, [showToast]);

  const showWarning = useCallback((title, message, duration) => {
    showToast({ type: 'warning', title, message, duration });
  }, [showToast]);

  const showInfo = useCallback((title, message, duration) => {
    showToast({ type: 'info', title, message, duration });
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};