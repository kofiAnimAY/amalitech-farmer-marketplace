import { createContext, useContext, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = 'success', duration = 3200) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-primary-600 shrink-0" />,
    error: <XCircle className="h-5 w-5 text-danger-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-accent-500 shrink-0" />,
  };

  return (
    <ToastContext.Provider value={{ notify, dismiss }}>
      {children}
      <div className="fixed top-4 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none sm:top-5">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-2xl border border-surface-line bg-white px-4 py-3 shadow-raised"
            >
              {icons[t.type]}
              <p className="flex-1 text-sm font-medium text-ink-800">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-full p-1 text-ink-400 hover:bg-surface-sunk hover:text-ink-700"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
