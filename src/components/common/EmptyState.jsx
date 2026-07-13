import { motion } from 'framer-motion';

/**
 * Empty states are a moment for direction, not decoration — always pair
 * the illustration/icon with a plain-language explanation and, where
 * possible, a single clear action.
 */
export default function EmptyState({ icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-line bg-white/60 px-6 py-14 text-center"
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-xs text-sm text-ink-600">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
