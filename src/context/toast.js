"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

import Toast from "@/components/Toast";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast deve ser usado dentro de um ToastProvider");
  }

  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, isRemoving: true } : toast
      )
    );

    // Remove from state after animation
    setTimeout(() => {
      setToasts((prev) =>
        prev.filter((toast) => toast.id !== id)
      );
    }, 300);
  }, []);

  const addToast = useCallback(
    (title, message, type = "info", duration = 5000) => {
      const id = Date.now() + Math.random();

      const newToast = {
        id,
        title,
        message,
        type,
        duration,
        isRemoving: false,
        isPaused: false,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback(
    (title, message, duration = 5000) => {
      return addToast(title, message, "success", duration);
    },
    [addToast]
  );

  const showError = useCallback(
    (title, message, duration = 5000) => {
      return addToast(title, message, "error", duration);
    },
    [addToast]
  );

  const showWarning = useCallback(
    (title, message, duration = 5000) => {
      return addToast(title, message, "warning", duration);
    },
    [addToast]
  );

  const showInfo = useCallback(
    (title, message, duration = 5000) => {
      return addToast(title, message, "info", duration);
    },
    [addToast]
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};