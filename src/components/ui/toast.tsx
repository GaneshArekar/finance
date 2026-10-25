"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: "success" | "error" | "info", title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
  success: () => {},
  error: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info", title?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message, title }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title = "Success") => toast(message, "success", title),
    [toast]
  );

  const error = useCallback(
    (message: string, title = "Error") => toast(message, "error", title),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all ${
                t.type === "success"
                  ? "bg-white/95 dark:bg-slate-900/95 border-emerald-500/30 text-slate-800 dark:text-slate-100"
                  : t.type === "error"
                  ? "bg-white/95 dark:bg-slate-900/95 border-rose-500/30 text-slate-800 dark:text-slate-100"
                  : "bg-white/95 dark:bg-slate-900/95 border-blue-500/30 text-slate-800 dark:text-slate-100"
              }`}
            >
              <div className="mt-0.5">
                {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                {t.type === "info" && <Info className="w-5 h-5 text-blue-500 shrink-0" />}
              </div>
              <div className="flex-1 min-w-0">
                {t.title && <p className="font-semibold text-sm leading-tight mb-0.5">{t.title}</p>}
                <p className="text-sm opacity-90 leading-relaxed break-words">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="opacity-50 hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
