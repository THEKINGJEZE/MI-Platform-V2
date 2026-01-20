"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Undo2,
  AlertCircle,
} from "lucide-react";

/**
 * Toast Types
 */
export type ToastType = "success" | "error" | "warning" | "info" | "undo";

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // ms, 0 = persistent
}

/**
 * Toast Context for global toast management
 */
interface ToastContextType {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, "id">) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

/**
 * Toast Provider
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * Individual Toast Component
 */
interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  undo: Undo2,
};

const styles = {
  success: "bg-success/15 border-success/30 text-success",
  error: "bg-danger/15 border-danger/30 text-danger",
  warning: "bg-warning/15 border-warning/30 text-warning",
  info: "bg-info/15 border-info/30 text-info",
  undo: "bg-action/15 border-action/30 text-action",
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const Icon = icons[toast.type];
  const duration = toast.duration ?? (toast.type === "undo" ? 30000 : 5000);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto-dismiss
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  return (
    <div
      role="alert"
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg",
        "transform transition-all duration-200",
        isVisible && !isExiting
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0",
        styles[toast.type],
        // Background overlay
        "bg-surface-0/95 backdrop-blur-sm"
      )}
    >
      {/* Icon */}
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-secondary mt-0.5">{toast.description}</p>
        )}

        {/* Action button (for undo toasts) */}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              handleDismiss();
            }}
            className={cn(
              "mt-2 text-sm font-medium underline underline-offset-2",
              "hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2",
              "focus:ring-action rounded px-1 -ml-1",
              // Minimum touch target
              "min-h-[44px] min-w-[44px] flex items-center"
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className={cn(
          "p-1.5 rounded-md hover:bg-surface-2 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-action",
          // Minimum touch target
          "min-h-[44px] min-w-[44px] flex items-center justify-center -mr-1.5"
        )}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4 text-muted" />
      </button>

      {/* Progress bar for undo toasts */}
      {toast.type === "undo" && duration > 0 && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-action/30 rounded-b-lg overflow-hidden"
        >
          <div
            className="h-full bg-action transition-all ease-linear"
            style={{
              width: "100%",
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Toast Container - Renders all active toasts
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "flex flex-col gap-2",
        "max-w-sm w-full"
      )}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}

      {/* Add keyframes for progress bar */}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
