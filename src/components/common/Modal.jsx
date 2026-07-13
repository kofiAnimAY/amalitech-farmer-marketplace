import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-sm' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className={`relative z-10 w-full ${maxWidth} rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-raised mb-0 sm:mb-8`}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-ink-400 hover:bg-surface-sunk hover:text-ink-700"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
